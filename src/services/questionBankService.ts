import { ref, getDownloadURL } from 'firebase/storage'
import { collection, getDocs } from 'firebase/firestore'
import { storage, db } from '../firebase'
import type { BankEntry, BankQuestion } from '../types/firestore'

// ─── XML Parsing ─────────────────────────────────────────────────

async function fetchStorageText(storagePath: string): Promise<string> {
  const url = await getDownloadURL(ref(storage, storagePath))
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${storagePath}: ${res.status}`)
  return res.text()
}

function parseXmlAttr(tag: string, attr: string): string {
  const match = tag.match(new RegExp(`${attr}="([^"]*)"`, 'i'))
  return match ? match[1] : ''
}

function getTagContent(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match ? match[1].trim() : ''
}

// ─── Master Index ────────────────────────────────────────────────

let cachedIndex: BankEntry[] | null = null

export async function fetchMasterIndex(forceRefresh = false): Promise<BankEntry[]> {
  if (cachedIndex && !forceRefresh) return cachedIndex

  const xml = await fetchStorageText('questionBanks/master.xml')

  const entries: BankEntry[] = []
  // Match <Bank id="...">...</Bank> blocks (child-element format)
  const bankRegex = /<Bank\s[^>]*>[\s\S]*?<\/Bank>/gi
  let match: RegExpExecArray | null
  while ((match = bankRegex.exec(xml)) !== null) {
    const block = match[0]
    const bankId = parseXmlAttr(block, 'id')
    // Derive section from bank ID: last 2-4 chars encode section (e.g., A1-MGH-0101 → "01.01")
    const idParts = bankId.split('-')
    const numericPart = idParts.length >= 3 ? idParts[idParts.length - 1] : ''
    const sectionNum = numericPart.length === 4
      ? `${numericPart.slice(0, 2)}.${numericPart.slice(2)}`
      : numericPart
    entries.push({
      id: bankId,
      path: getTagContent(block, 'Path'),
      subject: getTagContent(block, 'Subject'),
      chapter: getTagContent(block, 'Chapter'),
      section: sectionNum,
      title: getTagContent(block, 'Title'),
      book: getTagContent(block, 'Book'),
      tags: getTagContent(block, 'Tags'),
      questionCount: parseInt(getTagContent(block, 'QuestionCount') || '0', 10),
    })
  }

  cachedIndex = entries
  return entries
}

// ─── Individual Bank ─────────────────────────────────────────────

const bankCache = new Map<string, BankQuestion[]>()

export async function fetchQuestionBank(bankPath: string): Promise<BankQuestion[]> {
  if (bankCache.has(bankPath)) return bankCache.get(bankPath)!

  // Paths from master.xml are relative (e.g., "A1-MGH/file.xml"), need Storage prefix
  const storagePath = bankPath.startsWith('questionBanks/')
    ? bankPath
    : `questionBanks/${bankPath}`
  const xml = await fetchStorageText(storagePath)

  const questions: BankQuestion[] = []
  const qRegex = /<Question[\s\S]*?<\/Question>/gi
  let match: RegExpExecArray | null
  while ((match = qRegex.exec(xml)) !== null) {
    const qXml = match[0]
    const idMatch = qXml.match(/<Question[^>]*\sID="([^"]*)"/)
    const diffMatch = qXml.match(/<Difficulty>([\s\S]*?)<\/Difficulty>/i)

    const q: BankQuestion = {
      id: idMatch ? idMatch[1] : '',
      difficulty: diffMatch ? parseInt(diffMatch[1].trim(), 10) || 0 : 0,
      questionText: getTagContent(qXml, 'QuestionText'),
      questionContent: getTagContent(qXml, 'QuestionContent'),
      solution: getTagContent(qXml, 'Solution'),
      topic: getTagContent(qXml, 'Topic'),
      subtopic: getTagContent(qXml, 'Subtopic'),
    }

    const qImage = getTagContent(qXml, 'QuestionImage')
    if (qImage) q.questionImage = qImage
    const sImage = getTagContent(qXml, 'SolutionImage')
    if (sImage) q.solutionImage = sImage

    const qType = getTagContent(qXml, 'QuestionType')
    if (qType) q.questionType = qType

    const hints = getTagContent(qXml, 'Hints')
    if (hints) {
      q.hints = hints
        .split(/<Hint>/i)
        .map((h) => h.replace(/<\/Hint>/i, '').trim())
        .filter(Boolean)
    }

    const explanation = getTagContent(qXml, 'Explanation')
    if (explanation) q.explanation = explanation

    // Parse MCQ options
    const optionsBlock = getTagContent(qXml, 'Options')
    if (optionsBlock) {
      const optRegex = /<Option[^>]*>([\s\S]*?)<\/Option>/gi
      const opts: { text: string; correct: boolean }[] = []
      let oMatch: RegExpExecArray | null
      while ((oMatch = optRegex.exec(optionsBlock)) !== null) {
        const isCorrect = /correct="true"/i.test(oMatch[0])
        opts.push({ text: oMatch[1].trim(), correct: isCorrect })
      }
      if (opts.length > 0) q.options = opts
    }

    questions.push(q)
  }

  bankCache.set(bankPath, questions)
  return questions
}

// ─── Image Resolution ────────────────────────────────────────────

const imageUrlCache = new Map<string, string>()

export async function resolveQuestionImage(
  imagePath: string,
  bankPath: string
): Promise<string> {
  // Bank paths from master.xml are relative (e.g., "A1-MGH/file.xml");
  // ensure we resolve within the questionBanks/ Storage prefix
  const normalizedBankPath = bankPath.startsWith('questionBanks/')
    ? bankPath
    : `questionBanks/${bankPath}`

  let fullPath = imagePath
  if (!imagePath.startsWith('questionBanks/')) {
    const bankDir = normalizedBankPath.substring(0, normalizedBankPath.lastIndexOf('/') + 1)
    fullPath = bankDir + imagePath
  }

  if (imageUrlCache.has(fullPath)) return imageUrlCache.get(fullPath)!

  const url = await getDownloadURL(ref(storage, fullPath))
  imageUrlCache.set(fullPath, url)
  return url
}

// ─── Entitlement Check ──────────────────────────────────────────

export async function checkBankEntitlement(
  bankSubject: string,
  userId: string
): Promise<boolean> {
  // Check qbGrants subcollection
  const grantsSnap = await getDocs(collection(db, 'users', userId, 'qbGrants'))
  for (const grantDoc of grantsSnap.docs) {
    const data = grantDoc.data()
    // Check if grant covers this subject and hasn't expired
    if (data.subject === bankSubject || data.subject === 'all') {
      if (!data.expiresAt || data.expiresAt.toDate() > new Date()) {
        return true
      }
    }
  }

  // Check proGrants (Pro subscription = all banks)
  const proSnap = await getDocs(collection(db, 'users', userId, 'proGrants'))
  for (const proDoc of proSnap.docs) {
    const data = proDoc.data()
    if (!data.expiresAt || data.expiresAt.toDate() > new Date()) {
      return true
    }
  }

  return false
}

// ─── Cache Management ────────────────────────────────────────────

export function clearBankCache(): void {
  bankCache.clear()
  imageUrlCache.clear()
  cachedIndex = null
}
