import type { CSSProperties } from 'react'
import { fastForEach } from '../utils'

// these fields are shared among all RegularControlDescription. the helper function getControlSharedFields makes sure the types line up
interface ControlBaseFields {
  control: RegularControlType
  label?: string
  defaultValue?: unknown
  visibleByDefault?: boolean
}
function getControlSharedFields(control: RegularControlDescription): ControlBaseFields {
  return {
    control: control.control,
    label: control.label,
    defaultValue: control.defaultValue,
    visibleByDefault: control.visibleByDefault,
  }
}

// Base Level Controls

export type BaseControlType =
  | 'checkbox'
  | 'color'
  | 'euler'
  | 'expression-input'
  | 'expression-popuplist'
  | 'matrix3'
  | 'matrix4'
  | 'none'
  | 'number-input'
  | 'popuplist'
  | 'radio'
  | 'string-input'
  | 'style-controls'
  | 'vector2'
  | 'vector3'
  | 'vector4'

export interface CheckboxControlDescription {
  control: 'checkbox'
  label?: string
  defaultValue?: boolean
  visibleByDefault?: boolean
  disabledTitle?: string
  enabledTitle?: string
}

export interface ColorControlDescription {
  control: 'color'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: string
}

export type AllowedEnumType = string | boolean | number | undefined | null
export interface BasicControlOption<T> {
  value: T
  label: string
}

export type BasicControlOptions<T> = AllowedEnumType[] | BasicControlOption<T>[]

export interface PopUpListControlDescription {
  control: 'popuplist'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: unknown
  options: BasicControlOptions<unknown>
}

export interface ImportType {
  source: string // importSource
  name: string | null
  type: 'star' | 'default' | null
}

export interface ExpressionControlOption<T> {
  value: T
  expression: string
  label?: string
  requiredImport?: ImportType
}

export interface ExpressionPopUpListControlDescription {
  control: 'expression-popuplist'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: ExpressionControlOption<unknown>
  options: ExpressionControlOption<unknown>[]
}

export interface EulerControlDescription {
  control: 'euler'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: [number, number, number, string]
}

export interface NoneControlDescription {
  control: 'none'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: never
}

export interface Matrix3ControlDescription {
  control: 'matrix3'
  label?: string
  visibleByDefault?: boolean
  // prettier-ignore
  defaultValue?: [
    number, number, number,
    number, number, number,
    number, number, number,
  ]
}

export interface Matrix4ControlDescription {
  control: 'matrix4'
  label?: string
  visibleByDefault?: boolean
  // prettier-ignore
  defaultValue?: [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
  ]
}

export interface NumberInputControlDescription {
  control: 'number-input'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: number | null
  max?: number
  min?: number
  unit?: string
  step?: number
  displayStepper?: boolean
}

export interface RadioControlDescription {
  control: 'radio'
  label?: string
  defaultValue?: unknown
  visibleByDefault?: boolean
  options: BasicControlOptions<unknown>
}

export interface ExpressionInputControlDescription {
  control: 'expression-input'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: unknown
}

export interface StringInputControlDescription {
  control: 'string-input'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: string
  placeholder?: string
  obscured?: boolean
}

export interface StyleControlsControlDescription {
  control: 'style-controls'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: CSSProperties
  placeholder?: CSSProperties
}

export interface Vector2ControlDescription {
  control: 'vector2'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: [number, number]
}

export interface Vector3ControlDescription {
  control: 'vector3'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: [number, number, number]
}

export interface Vector4ControlDescription {
  control: 'vector4'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: [number, number, number, number]
}

export type BaseControlDescription =
  | CheckboxControlDescription
  | ColorControlDescription
  | ExpressionInputControlDescription
  | ExpressionPopUpListControlDescription
  | EulerControlDescription
  | NoneControlDescription
  | Matrix3ControlDescription
  | Matrix4ControlDescription
  | NumberInputControlDescription
  | RadioControlDescription
  | PopUpListControlDescription
  | StringInputControlDescription
  | StyleControlsControlDescription
  | Vector2ControlDescription
  | Vector3ControlDescription
  | Vector4ControlDescription

// Higher Level Controls

export type HigherLevelControlType = 'array' | 'tuple' | 'object' | 'union'
export type RegularControlType = BaseControlType | HigherLevelControlType
export type ControlType = RegularControlType | 'folder'

export interface ArrayControlDescription {
  control: 'array'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: unknown[]
  propertyControl: RegularControlDescription
  maxCount?: number
}

export interface ObjectControlDescription {
  control: 'object'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: unknown
  object: { [prop: string]: RegularControlDescription }
}

export interface UnionControlDescription {
  control: 'union'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: unknown
  controls: Array<RegularControlDescription>
}
export interface TupleControlDescription {
  control: 'tuple'
  label?: string
  visibleByDefault?: boolean
  defaultValue?: unknown[]
  propertyControls: RegularControlDescription[]
}

export interface FolderControlDescription {
  control: 'folder'
  label?: string
  controls: PropertyControls
}

export type HigherLevelControlDescription =
  | ArrayControlDescription
  | ObjectControlDescription
  | TupleControlDescription
  | UnionControlDescription

export type RegularControlDescription = BaseControlDescription | HigherLevelControlDescription

// Please ensure that `property-controls-utils.ts` is kept up to date
// with any changes to this or the component types.
export type ControlDescription = RegularControlDescription | FolderControlDescription

export function isBaseControlDescription(
  control: ControlDescription,
): control is BaseControlDescription {
  switch (control.control) {
    case 'checkbox':
    case 'color':
    case 'euler':
    case 'expression-input':
    case 'expression-popuplist':
    case 'matrix3':
    case 'matrix4':
    case 'none':
    case 'number-input':
    case 'popuplist':
    case 'radio':
    case 'string-input':
    case 'style-controls':
    case 'vector2':
    case 'vector3':
    case 'vector4':
      return true
    case 'array':
    case 'object':
    case 'tuple':
    case 'union':
    case 'folder':
      return false
    default:
      const _exhaustiveCheck: never = control
      throw new Error(`Unhandled controls ${JSON.stringify(control)}`)
  }
}

export function isHigherLevelControlDescription(
  control: ControlDescription,
): control is HigherLevelControlDescription {
  return !isBaseControlDescription(control)
}

export type PropertyControls = {
  [key: string]: ControlDescription
}

export function addPropertyControls(component: unknown, propertyControls: PropertyControls): void {
  if (component != null) {
    ;(component as any)['propertyControls'] = propertyControls
  }
}

export function getDefaultProps(propertyControls: PropertyControls): { [prop: string]: unknown } {
  let defaults: { [prop: string]: unknown } = {}
  const propKeys = Object.keys(propertyControls)
  fastForEach(propKeys, (prop) => {
    const control = propertyControls[prop]
    if (control != null) {
      if (isBaseControlDescription(control) || isHigherLevelControlDescription(control)) {
        if (control.defaultValue != null) {
          defaults[prop] = control.defaultValue
        }
      } else {
        defaults = {
          ...defaults,
          ...getDefaultProps(control.controls),
        }
      }
    }
  })
  return defaults
}

export function expression<T>(
  value: T,
  expressionString: string,
  requiredImport?: ImportType,
): ExpressionControlOption<T> {
  return {
    value: value,
    expression: expressionString,
    requiredImport: requiredImport,
  }
}

export function importStar(source: string, name: string): ImportType {
  return {
    source: source,
    name: name,
    type: 'star',
  }
}
export function importDefault(source: string, name: string): ImportType {
  return {
    source: source,
    name: name,
    type: 'default',
  }
}
export function importNamed(source: string, name: string): ImportType {
  return {
    source: source,
    name: name,
    type: null,
  }
}
