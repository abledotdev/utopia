import * as R from 'ramda'
import {
  SceneMetadata,
  StaticInstancePath,
  ScenePath,
  SceneContainer,
  PropertyPath,
} from '../shared/project-file-types'
import {
  UtopiaJSXComponent,
  utopiaJSXComponent,
  jsxElement,
  JSXElement,
  jsxAttributeValue,
  isJSXElement,
  JSXElementChild,
  TopLevelElement,
  isUtopiaJSXComponent,
  JSXAttributes,
  defaultPropsParam,
  jsxAttributeOtherJavaScript,
  ComponentMetadata,
} from '../shared/element-template'
import * as TP from '../shared/template-path'
import * as PP from '../shared/property-path'
import {
  eitherToMaybe,
  applicative5Either,
  flatMapEither,
  isLeft,
  applicative6Either,
  right,
} from '../shared/either'
import { memoize } from '../shared/memoize'
import * as fastDeepEqual from 'fast-deep-equal'
import {
  getModifiableJSXAttributeAtPath,
  jsxSimpleAttributeToValue,
} from '../shared/jsx-attributes'
import { stripNulls } from '../shared/array-utils'
import { isPercentPin } from 'utopia-api'
import { UTOPIA_UID_KEY } from './utopia-constants'

export const EmptyScenePathForStoryboard = TP.scenePath([])

export const PathForSceneComponent = PP.create(['component'])
export const PathForSceneDataUid = PP.create(['data-uid'])
export const PathForSceneDataLabel = PP.create(['data-label'])
export const PathForSceneContainer = PP.create(['layout'])
export const PathForSceneFrame = PP.create(['style'])

export const BakedInStoryboardUID = 'utopia-storyboard-uid'
export const BakedInStoryboardVariableName = 'storyboard'

export const EmptyUtopiaCanvasComponent = convertScenesToUtopiaCanvasComponent([])

export const PathForSceneProps = PP.create(['props'])
export const PathForSceneStyle = PP.create(['style'])

export const PathForResizeContent = PP.create(['resizeContent'])

export function createSceneUidFromIndex(sceneIndex: number): string {
  return `scene-${sceneIndex}`
}

export function createSceneTemplatePath(scenePath: ScenePath): StaticInstancePath {
  return TP.staticInstancePath(scenePath, scenePath.sceneElementPath)
}

export function createNewSceneElement(
  uid: string,
  component: string | null,
  props: { [key: string]: any },
  frame: {
    left: number
    top: number
    width: number
    height: number
  },
  container: SceneContainer,
  label?: string,
): JSXElement {
  return mapScene(sceneMetadata(uid, component, props, frame, container, label))
}

export function mapScene(scene: SceneMetadata): JSXElement {
  const sceneProps = {
    component: jsxAttributeOtherJavaScript(
      scene.component ?? 'null',
      `return ${scene.component}`,
      [],
      null,
    ),
    props: jsxAttributeValue(scene.props),
    style: jsxAttributeValue(scene.frame),
    layout: jsxAttributeValue(scene.container),
    'data-uid': jsxAttributeValue(scene.uid),
    'data-label': jsxAttributeValue(scene.label),
  }
  return jsxElement('Scene', sceneProps, [])
}

export function unmapScene(element: JSXElementChild): SceneMetadata | null {
  if (!isJSXElement(element) || element.name.baseVariable !== 'Scene') {
    return null
  }
  return eitherToMaybe(
    applicative6Either(
      (component, props, style, layout, label, uid) => {
        const scene: SceneMetadata = {
          uid: uid,
          component: component,
          props: props,
          frame: style,
          container: layout,
          ...(label == null ? {} : { label: label }),
        }
        return scene
      },
      getSimpleAttributeAtPathCustom(element.props, PP.create(['component'])),
      getSimpleAttributeAtPathCustom(element.props, PP.create(['props'])),
      getSimpleAttributeAtPathCustom(element.props, PP.create(['style'])),
      getSimpleAttributeAtPathCustom(element.props, PP.create(['layout'])),
      getSimpleAttributeAtPathCustom(element.props, PP.create(['data-label'])),
      getSimpleAttributeAtPathCustom(element.props, PP.create(['data-uid'])),
    ),
  )
}

export function convertScenesToUtopiaCanvasComponent(
  scenes: Array<SceneMetadata>,
): UtopiaJSXComponent
export function convertScenesToUtopiaCanvasComponent(scenes: null): null
export function convertScenesToUtopiaCanvasComponent(
  scenes: Array<SceneMetadata> | null,
): UtopiaJSXComponent | null
export function convertScenesToUtopiaCanvasComponent(
  scenes: Array<SceneMetadata> | null,
): UtopiaJSXComponent | null {
  if (scenes == null) {
    return null
  }
  return utopiaJSXComponent(
    BakedInStoryboardVariableName,
    false,
    null,
    [],
    jsxElement(
      'Storyboard',
      { 'data-uid': jsxAttributeValue(BakedInStoryboardUID) },
      scenes.map(mapScene),
    ),
    null,
  )
}

export function createSceneFromComponent(component: UtopiaJSXComponent, uid: string): JSXElement {
  const sceneProps = {
    component: jsxAttributeOtherJavaScript(
      component.name,
      `return ${component.name}`,
      [component.name],
      null,
    ),
    [UTOPIA_UID_KEY]: jsxAttributeValue(uid),
    props: jsxAttributeValue({}),
    style: jsxAttributeValue({
      position: 'absolute',
      left: 0,
      top: 0,
      width: 375,
      height: 812,
    }),
  }
  return jsxElement('Scene', sceneProps, [])
}

export function createStoryboardElement(scenes: Array<JSXElement>, uid: string): JSXElement {
  const storyboardProps = {
    [UTOPIA_UID_KEY]: jsxAttributeValue(uid),
    layout: jsxAttributeValue({ layoutSystem: 'pinSystem' }),
  }
  return jsxElement('Storyboard', storyboardProps, scenes)
}

export function convertUtopiaCanvasComponentToScenes(
  utopiaCanvasComponent: UtopiaJSXComponent | null,
): Array<SceneMetadata> | null {
  if (utopiaCanvasComponent == null) {
    return null
  }
  const rootElement = utopiaCanvasComponent.rootElement
  if (!isJSXElement(rootElement) || rootElement.name.baseVariable !== 'Storyboard') {
    throw new Error('the root element must be a Storyboard component')
  }
  const firstChildrenScenes: Array<SceneMetadata> = stripNulls(rootElement.children.map(unmapScene))
  return firstChildrenScenes
}

const convertScenesAndTopLevelElementsToUtopiaCanvasComponentMemoized = memoize(
  (scenes: Array<SceneMetadata>, topLevelElements: Array<TopLevelElement>) => [
    ...topLevelElements,
    convertScenesToUtopiaCanvasComponent(scenes),
  ],
  { equals: fastDeepEqual }, // delete me as soon as possible
)

export function convertScenesAndTopLevelElementsToUtopiaCanvasComponent(
  scenes: Array<SceneMetadata>,
  topLevelElements: Array<UtopiaJSXComponent>,
): Array<UtopiaJSXComponent>
export function convertScenesAndTopLevelElementsToUtopiaCanvasComponent(
  scenes: Array<SceneMetadata>,
  topLevelElements: Array<TopLevelElement>,
): Array<TopLevelElement>
export function convertScenesAndTopLevelElementsToUtopiaCanvasComponent(
  scenes: Array<SceneMetadata>,
  topLevelElements: Array<TopLevelElement>,
): Array<TopLevelElement> {
  return convertScenesAndTopLevelElementsToUtopiaCanvasComponentMemoized(scenes, topLevelElements)
}

export function convertTopLevelElementsBackToScenesAndTopLevelElements_FOR_PP_ONLY(
  topLevelElements: Array<UtopiaJSXComponent>,
): { topLevelElements: Array<UtopiaJSXComponent>; utopiaCanvas: UtopiaJSXComponent | null }
export function convertTopLevelElementsBackToScenesAndTopLevelElements_FOR_PP_ONLY(
  topLevelElements: Array<TopLevelElement>,
): { topLevelElements: Array<TopLevelElement>; utopiaCanvas: UtopiaJSXComponent | null }
export function convertTopLevelElementsBackToScenesAndTopLevelElements_FOR_PP_ONLY(
  topLevelElements: Array<TopLevelElement>,
): { topLevelElements: Array<TopLevelElement>; utopiaCanvas: UtopiaJSXComponent | null } {
  const [[utopiaCanvas], filteredTopLevelElements] = R.partition(
    (e): e is UtopiaJSXComponent =>
      isUtopiaJSXComponent(e) && e.name === BakedInStoryboardVariableName,
    topLevelElements,
  )
  return {
    topLevelElements: filteredTopLevelElements,
    utopiaCanvas: utopiaCanvas as UtopiaJSXComponent | null,
  }
}

export function fishOutUtopiaCanvasFromTopLevelElements(
  topLevelElements: Array<TopLevelElement>,
): UtopiaJSXComponent | null {
  return (
    topLevelElements.find((e): e is UtopiaJSXComponent => {
      return isUtopiaJSXComponent(e) && e.name === BakedInStoryboardVariableName
    }) ?? null
  )
}

function getSimpleAttributeAtPathCustom(attributes: JSXAttributes, path: PropertyPath) {
  const getAttrResult = getModifiableJSXAttributeAtPath(attributes, path)
  return flatMapEither((attr) => {
    const simpleValue = jsxSimpleAttributeToValue(attr)
    if (isLeft(simpleValue) && attr.type === 'ATTRIBUTE_OTHER_JAVASCRIPT') {
      return right(attr.javascript)
    } else {
      return simpleValue
    }
  }, getAttrResult)
}

export function sceneMetadata(
  uid: string,
  component: string | null,
  props: { [key: string]: any },
  frame: {
    left: number
    top: number
    width: number
    height: number
  },
  container: SceneContainer,
  label?: string,
): SceneMetadata {
  let scene: SceneMetadata = {
    uid: uid,
    component: component,
    frame: frame,
    props: props,
    container: container,
  }

  if (label != null) {
    // This is annoying, but if we don't do this then we'll explicitly print
    // `undefined` in the label field, meaning the JSON won't parse
    scene.label = label
  }

  return scene
}

export function isSceneElement(element: JSXElement): boolean {
  // TODO SCENES, how to decide if something is a scene?
  return element.name.baseVariable === 'Scene'
}

export function isSceneChildWidthHeightPercentage(scene: ComponentMetadata): boolean {
  const rootElementSizes = scene.rootElements.map((element) => {
    return {
      width: element.props?.style?.width,
      height: element.props?.style?.height,
    }
  })

  return rootElementSizes.some((size) => isPercentPin(size.width) || isPercentPin(size.height))
}

export function isDynamicSceneChildWidthHeightPercentage(scene: ComponentMetadata): boolean {
  const isDynamicScene = scene.sceneResizesContent

  return isDynamicScene && isSceneChildWidthHeightPercentage(scene)
}
