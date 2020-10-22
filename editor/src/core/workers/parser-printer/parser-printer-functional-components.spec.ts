import {
  clearParseResultUniqueIDs,
  testParseCode,
  JustImportViewAndReact,
} from './parser-printer-test-utils'
import {
  jsxElement,
  jsxAttributeValue,
  utopiaJSXComponent,
  defaultPropsParam,
  clearTopLevelElementUniqueIDs,
  functionParam,
  regularParam,
  destructuredObject,
  destructuredParamPart,
  destructuredArray,
  omittedParam,
  jsxAttributeOtherJavaScript,
} from '../../shared/element-template'
import { right, isRight } from '../../shared/either'
import { parseSuccess } from '../common/project-file-utils'
import { printCode, printCodeOptions } from './parser-printer'
import { ParseSuccess } from '../../shared/project-file-types'

const codeWithBasicPropsObject = `import React from "react";
import { View } from "utopia-api";
export var whatever = (props) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithBasicPropsObjectWithDefault = `import React from "react";
import { View } from "utopia-api";
export var whatever = (props = {thing: true}) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithRenamedBasicPropsObject = `import React from "react";
import { View } from "utopia-api";
export var whatever = (myProps) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithDestructuredPropsObject = `import React from "react";
import { View } from "utopia-api";
export var whatever = ({prop}) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithDestructuredPropsObjectWithDefault = `import React from "react";
import { View } from "utopia-api";
export var whatever = ({prop = 5}) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithDestructuredPropsObjectWithRenamedParam = `import React from "react";
import { View } from "utopia-api";
export var whatever = ({prop: renamedProp}) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithDestructuredPropsObjectWithRenamedParamAndDefault = `import React from "react";
import { View } from "utopia-api";
export var whatever = ({prop: renamedProp = 5}) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithDestructuredPropsObjectWithRestParam = `import React from "react";
import { View } from "utopia-api";
export var whatever = ({prop, ...otherProps}) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithDestructuredArray = `import React from "react";
import { View } from "utopia-api";
export var whatever = ([prop]) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithDestructuredArrayWithDefault = `import React from "react";
import { View } from "utopia-api";
export var whatever = ([prop = 5]) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`
const codeWithDestructuredArrayWithOmittedParam = `import React from "react";
import { View } from "utopia-api";
export var whatever = ([prop1, ,prop2]) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithNestedDestructuredPropsMess = `import React from "react";
import { View } from "utopia-api";
export var whatever = ({arrayPart: [prop1, ,{ prop2: renamedProp2, ...otherObjectProps }, ...otherArrayProps]}) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

const codeWithNestedDestructuredPropsMessWithDefaults = `import React from "react";
import { View } from "utopia-api";
export var whatever = ({arrayPart: [prop1 = 5, ,{ prop2: renamedProp2 = {thing: true}, ...otherObjectProps }, ...otherArrayProps]}) => {
  return (
    <View data-uid={'aaa'} />
  )
}
`

describe('Parsing a function component with props', () => {
  it('Correctly parses a basic props object', () => {
    const actualResult = clearParseResultUniqueIDs(testParseCode(codeWithBasicPropsObject))
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const exported = utopiaJSXComponent('whatever', true, defaultPropsParam, [], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithBasicPropsObject,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a basic props object with default', () => {
    const actualResult = clearParseResultUniqueIDs(
      testParseCode(codeWithBasicPropsObjectWithDefault),
    )
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const propsParam = functionParam(
      false,
      regularParam(
        'props',
        jsxAttributeOtherJavaScript(
          '{thing: true}',
          `return ({
  thing: true
});`,
          [],
          expect.objectContaining({}),
        ),
      ),
    )
    const exported = utopiaJSXComponent('whatever', true, propsParam, [], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithBasicPropsObjectWithDefault,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a basic props object with a different name', () => {
    const actualResult = clearParseResultUniqueIDs(testParseCode(codeWithRenamedBasicPropsObject))
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const propsParam = functionParam(false, regularParam('myProps', null))
    const exported = utopiaJSXComponent('whatever', true, propsParam, [], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithRenamedBasicPropsObject,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a destructured props object', () => {
    const actualResult = clearParseResultUniqueIDs(testParseCode(codeWithDestructuredPropsObject))
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const destructuredParam = functionParam(false, regularParam('prop', null))
    const propsParam = functionParam(
      false,
      destructuredObject([destructuredParamPart(undefined, destructuredParam, null)]),
    )
    const exported = utopiaJSXComponent('whatever', true, propsParam, ['prop'], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithDestructuredPropsObject,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a destructured props object with a default', () => {
    const actualResult = clearParseResultUniqueIDs(
      testParseCode(codeWithDestructuredPropsObjectWithDefault),
    )
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const destructuredParam = functionParam(
      false,
      regularParam(
        'prop',
        jsxAttributeOtherJavaScript('5', 'return 5;', [], expect.objectContaining({})),
      ),
    )
    const propsParam = functionParam(
      false,
      destructuredObject([destructuredParamPart(undefined, destructuredParam, null)]),
    )
    const exported = utopiaJSXComponent('whatever', true, propsParam, ['prop'], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithDestructuredPropsObjectWithDefault,
        expect.objectContaining({}),
        null,
        null,
      ),
    )

    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a destructured props object that renames the param', () => {
    const actualResult = clearParseResultUniqueIDs(
      testParseCode(codeWithDestructuredPropsObjectWithRenamedParam),
    )
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const destructuredParam = functionParam(false, regularParam('renamedProp', null))
    const propsParam = functionParam(
      false,
      destructuredObject([destructuredParamPart('prop', destructuredParam, null)]),
    )
    const exported = utopiaJSXComponent('whatever', true, propsParam, ['prop'], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithDestructuredPropsObjectWithRenamedParam,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a destructured props object that renames the param with a default', () => {
    const actualResult = clearParseResultUniqueIDs(
      testParseCode(codeWithDestructuredPropsObjectWithRenamedParamAndDefault),
    )
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const destructuredParam = functionParam(
      false,
      regularParam(
        'renamedProp',
        jsxAttributeOtherJavaScript('5', 'return 5;', [], expect.objectContaining({})),
      ),
    )
    const propsParam = functionParam(
      false,
      destructuredObject([destructuredParamPart('prop', destructuredParam, null)]),
    )
    const exported = utopiaJSXComponent('whatever', true, propsParam, ['prop'], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithDestructuredPropsObjectWithRenamedParamAndDefault,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a destructured props object that uses a rest param', () => {
    const actualResult = clearParseResultUniqueIDs(
      testParseCode(codeWithDestructuredPropsObjectWithRestParam),
    )
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const destructuredParam1 = functionParam(false, regularParam('prop', null))
    const destructuredRestParam = functionParam(true, regularParam('otherProps', null))
    const destructuredParams = [
      destructuredParamPart(undefined, destructuredParam1, null),
      destructuredParamPart(undefined, destructuredRestParam, null),
    ]
    const propsParam = functionParam(false, destructuredObject(destructuredParams))
    const exported = utopiaJSXComponent('whatever', true, propsParam, ['prop'], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithDestructuredPropsObjectWithRestParam,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a destructured props array', () => {
    const actualResult = clearParseResultUniqueIDs(testParseCode(codeWithDestructuredArray))
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const destructuredParam = functionParam(false, regularParam('prop', null))
    const propsParam = functionParam(false, destructuredArray([destructuredParam]))
    const exported = utopiaJSXComponent('whatever', true, propsParam, [], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithDestructuredArray,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a destructured props array with a default', () => {
    const actualResult = clearParseResultUniqueIDs(
      testParseCode(codeWithDestructuredArrayWithDefault),
    )
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const destructuredParam = functionParam(
      false,
      regularParam(
        'prop',
        jsxAttributeOtherJavaScript('5', 'return 5;', [], expect.objectContaining({})),
      ),
    )
    const propsParam = functionParam(false, destructuredArray([destructuredParam]))
    const exported = utopiaJSXComponent('whatever', true, propsParam, [], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithDestructuredArrayWithDefault,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a destructured props array with an omitted param', () => {
    const actualResult = clearParseResultUniqueIDs(
      testParseCode(codeWithDestructuredArrayWithOmittedParam),
    )
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const destructuredParam1 = functionParam(false, regularParam('prop1', null))
    const destructuredParam2 = functionParam(false, regularParam('prop2', null))
    const propsParam = functionParam(
      false,
      destructuredArray([destructuredParam1, omittedParam(), destructuredParam2]),
    )
    const exported = utopiaJSXComponent('whatever', true, propsParam, [], view, null)
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithDestructuredArrayWithOmittedParam,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a nested destructured props mess', () => {
    const actualResult = clearParseResultUniqueIDs(
      testParseCode(codeWithNestedDestructuredPropsMess),
    )
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const otherArrayProps = functionParam(true, regularParam('otherArrayProps', null))
    const renamedProp2 = functionParam(false, regularParam('renamedProp2', null))
    const otherObjectProps = functionParam(true, regularParam('otherObjectProps', null))
    const innerDestructuredObject = functionParam(
      false,
      destructuredObject([
        destructuredParamPart('prop2', renamedProp2, null),
        destructuredParamPart(undefined, otherObjectProps, null),
      ]),
    )
    const prop1 = functionParam(false, regularParam('prop1', null))
    const destructuredArrayParam = functionParam(
      false,
      destructuredArray([prop1, omittedParam(), innerDestructuredObject, otherArrayProps]),
    )
    const outerDestructuredObject = functionParam(
      false,
      destructuredObject([destructuredParamPart('arrayPart', destructuredArrayParam, null)]),
    )
    const exported = utopiaJSXComponent(
      'whatever',
      true,
      outerDestructuredObject,
      ['arrayPart'],
      view,
      null,
    )
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithNestedDestructuredPropsMess,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })

  it('Correctly parses a nested destructured props mess with defaults', () => {
    const actualResult = clearParseResultUniqueIDs(
      testParseCode(codeWithNestedDestructuredPropsMessWithDefaults),
    )
    const view = jsxElement(
      'View',
      {
        'data-uid': jsxAttributeValue('aaa'),
      },
      [],
    )
    const otherArrayProps = functionParam(true, regularParam('otherArrayProps', null))
    const renamedProp2 = functionParam(
      false,
      regularParam(
        'renamedProp2',
        jsxAttributeOtherJavaScript(
          '{thing: true}',
          `return ({
  thing: true
});`,
          [],
          expect.objectContaining({}),
        ),
      ),
    )
    const otherObjectProps = functionParam(true, regularParam('otherObjectProps', null))
    const innerDestructuredObject = functionParam(
      false,
      destructuredObject([
        destructuredParamPart('prop2', renamedProp2, null),
        destructuredParamPart(undefined, otherObjectProps, null),
      ]),
    )
    const prop1 = functionParam(
      false,
      regularParam(
        'prop1',
        jsxAttributeOtherJavaScript('5', 'return 5;', [], expect.objectContaining({})),
      ),
    )
    const destructuredArrayParam = functionParam(
      false,
      destructuredArray([prop1, omittedParam(), innerDestructuredObject, otherArrayProps]),
    )
    const outerDestructuredObject = functionParam(
      false,
      destructuredObject([destructuredParamPart('arrayPart', destructuredArrayParam, null)]),
    )
    const exported = utopiaJSXComponent(
      'whatever',
      true,
      outerDestructuredObject,
      ['arrayPart'],
      view,
      null,
    )
    const topLevelElements = [exported].map(clearTopLevelElementUniqueIDs)
    const expectedResult = right(
      parseSuccess(
        JustImportViewAndReact,
        [...topLevelElements],
        codeWithNestedDestructuredPropsMessWithDefaults,
        expect.objectContaining({}),
        null,
        null,
      ),
    )
    expect(actualResult).toEqual(expectedResult)
  })
})

describe('Parsing, printing, reparsing a function component with props', () => {
  // The below tests are all based on the assumption that we know the parsed models are correct
  // due to the above tests

  function testParsePrintParse(code: string) {
    const firstParse = clearParseResultUniqueIDs(testParseCode(code))

    expect(isRight(firstParse)).toBeTruthy()

    const firstAsParseSuccess = firstParse.value as ParseSuccess

    const printed = printCode(
      printCodeOptions(false, true, true),
      firstAsParseSuccess.imports,
      firstAsParseSuccess.topLevelElements,
      firstAsParseSuccess.jsxFactoryFunction,
    )

    const secondParse = clearParseResultUniqueIDs(testParseCode(printed))

    expect(isRight(secondParse)).toBeTruthy()

    const secondAsParseSuccess = firstParse.value as ParseSuccess
    expect(secondAsParseSuccess.topLevelElements[0]).toEqual(
      firstAsParseSuccess.topLevelElements[0],
    )
  }

  it('Correctly parses back and forth a basic props object', () => {
    testParsePrintParse(codeWithBasicPropsObject)
  })

  it('Correctly parses back and forth a basic props object with a default', () => {
    testParsePrintParse(codeWithBasicPropsObjectWithDefault)
  })

  it('Correctly parses back and forth a basic props object with a different name', () => {
    testParsePrintParse(codeWithRenamedBasicPropsObject)
  })

  it('Correctly parses back and forth a destructured props object', () => {
    testParsePrintParse(codeWithDestructuredPropsObject)
  })

  it('Correctly parses back and forth a destructured props object with a default', () => {
    testParsePrintParse(codeWithDestructuredPropsObjectWithDefault)
  })

  it('Correctly parses back and forth a destructured props object that renames the param', () => {
    testParsePrintParse(codeWithDestructuredPropsObjectWithRenamedParam)
  })

  it('Correctly parses back and forth a destructured props object that renames the param with a default', () => {
    testParsePrintParse(codeWithDestructuredPropsObjectWithRenamedParamAndDefault)
  })

  it('Correctly parses back and forth a destructured props object that uses a rest param', () => {
    testParsePrintParse(codeWithDestructuredPropsObjectWithRestParam)
  })

  it('Correctly parses back and forth a destructured props array', () => {
    testParsePrintParse(codeWithDestructuredArray)
  })

  it('Correctly parses back and forth a destructured props array with a default', () => {
    testParsePrintParse(codeWithDestructuredArrayWithDefault)
  })

  it('Correctly parses back and forth a destructured props array with an omitted param', () => {
    testParsePrintParse(codeWithDestructuredArrayWithOmittedParam)
  })

  it('Correctly parses back and forth a nested destructured props mess', () => {
    testParsePrintParse(codeWithNestedDestructuredPropsMess)
  })

  it('Correctly parses back and forth a nested destructured props mess with defaults', () => {
    testParsePrintParse(codeWithNestedDestructuredPropsMessWithDefaults)
  })
})
