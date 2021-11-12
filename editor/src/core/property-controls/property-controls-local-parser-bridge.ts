import { Either, isRight, left, mapEither, right } from '../shared/either'
import {
  ArbitraryJSBlock,
  clearJSXElementUniqueIDs,
  JSXElementChild,
  JSXElementWithoutUID,
  UtopiaJSXComponent,
} from '../shared/element-template'
import { jsxSimpleAttributesToProps } from '../shared/jsx-attributes'
import { objectMapDropNulls } from '../shared/object-utils'
import { Imports, isParseFailure, isParseSuccess } from '../shared/project-file-types'
import { createParseFile, getParseResult, UtopiaTsWorkers } from '../workers/common/worker-types'

type ProcessedParseResult = Either<
  string,
  { importsToAdd: Imports; elementToInsert: JSXElementWithoutUID }
>
const resultCache: Map<string, ProcessedParseResult> = new Map()

export async function getCachedParseResultForUserStrings(
  workers: UtopiaTsWorkers,
  imports: string,
  toInsert: string,
): Promise<ProcessedParseResult> {
  const cacheKey = imports + toInsert
  const cachedResult = resultCache.get(cacheKey)
  if (cachedResult != null) {
    return cachedResult
  } else {
    const result = await getParseResultForUserStrings(workers, imports, toInsert)
    resultCache.set(cacheKey, result)
    return result
  }
}

async function getParseResultForUserStrings(
  workers: UtopiaTsWorkers,
  imports: string,
  toInsert: string,
): Promise<ProcessedParseResult> {
  const parseResult = await getParseResult(workers, [
    createParseFile(
      'code.tsx',
      `${imports};

       function Utopia$$$Component(props) {
          return (
            ${toInsert}
          )
         }`,
      null,
      Date.now(),
    ),
  ])

  if (parseResult[0].type === 'parsefileresult') {
    const parseFileResult = parseResult[0]
    if (isParseSuccess(parseFileResult.parseResult)) {
      const parsedImports = parseFileResult.parseResult.imports
      const parsedWrapperComponent = parseFileResult.parseResult.topLevelElements.find(
        (topLevelElement): topLevelElement is UtopiaJSXComponent =>
          topLevelElement.type === 'UTOPIA_JSX_COMPONENT' &&
          topLevelElement.name === 'Utopia$$$Component',
      )
      const parsedWrapperIsArbitrary = parseFileResult.parseResult.topLevelElements.find(
        (topLevelElement): topLevelElement is ArbitraryJSBlock =>
          topLevelElement.type === 'ARBITRARY_JS_BLOCK' &&
          topLevelElement.definedWithin.includes('Utopia$$$Component'),
      )
      if (parsedWrapperComponent != null) {
        const elementToInsert = clearJSXElementUniqueIDs(parsedWrapperComponent.rootElement)

        if (elementToInsert.type === 'JSX_ELEMENT') {
          return right({
            importsToAdd: parsedImports,
            elementToInsert: elementToInsert,
          })
        } else {
          return left('Element to insert must be a correct JSXElement')
        }
      } else if (parsedWrapperIsArbitrary != null) {
        return left('Element cannot be inserted without its import statement')
      } else {
        return left('could not find Utopia$$$Component')
      }
    } else if (isParseFailure(parseFileResult.parseResult)) {
      // TODO better error messages!
      return left(parseFileResult.parseResult.errorMessages.map((em) => em.message).join(', '))
    }
  }

  return left('Unknown error')
}
