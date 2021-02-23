import * as React from 'react'

import * as PP from '../../../../../core/shared/property-path'
import { OptionChainControl } from '../../../controls/option-chain-control'
import {
  useInspectorLayoutInfo,
  InspectorCallbackContext,
  useInspectorInfo,
  useInspectorStyleInfo,
  InspectorInfo,
} from '../../../common/property-path-hooks'
import { useEditorState } from '../../../../editor/store/store-hook'
import { switchLayoutSystem } from '../../../../editor/actions/action-creators'
import {
  getControlStatusFromPropertyStatus,
  getControlStyles,
  ControlStatus,
  ControlStyles,
} from '../../../common/control-status'
import { LayoutSystem } from 'utopia-api'
import { createLayoutPropertyPath } from '../../../../../core/layout/layout-helpers-new'
import {
  DetectedLayoutSystem,
  SettableLayoutSystem,
  SpecialSizeMeasurements,
} from '../../../../../core/shared/element-template'
import {
  useWrappedEmptyOrUnknownOnSubmitValue,
  ChainedNumberInput,
  SquareButton,
  FunctionIcons,
} from '../../../../../uuiui'
import { betterReactMemo } from '../../../../../uuiui-deps'
import { useInspectorInfoLonghandShorthand } from '../../../common/longhand-shorthand-hooks'

function useDefaultedLayoutSystemInfo(): {
  value: LayoutSystem | 'flow'
  controlStatus: ControlStatus
  controlStyles: ControlStyles
} {
  const layoutSystemMetadata = useInspectorLayoutInfo('LayoutSystem')
  const styleDisplayMetadata = useInspectorStyleInfo('display')

  let metadataToUse: InspectorInfo<any> = layoutSystemMetadata
  if (styleDisplayMetadata.value === 'flex') {
    metadataToUse = styleDisplayMetadata
  }

  if (metadataToUse.value == null) {
    const updatedPropertyStatus = {
      ...layoutSystemMetadata.propertyStatus,
      set: true,
    }
    const controlStatus = getControlStatusFromPropertyStatus(updatedPropertyStatus)
    const controlStyles = getControlStyles(controlStatus)
    return {
      value: 'flow',
      controlStatus,
      controlStyles,
    }
  } else {
    return {
      value: metadataToUse.value,
      controlStatus: metadataToUse.controlStatus,
      controlStyles: metadataToUse.controlStyles,
    }
  }
}

function useLayoutSystemData() {
  const dispatch = useEditorState((store) => store.dispatch, 'useLayoutSystemData dispatch')

  const onLayoutSystemChange = React.useCallback(
    (layoutSystem: SettableLayoutSystem) => {
      switch (layoutSystem) {
        case LayoutSystem.PinSystem:
        case 'flow':
        case 'flex':
          dispatch([switchLayoutSystem(layoutSystem)], 'everyone')
          break
        case LayoutSystem.Group:
        case 'grid':
          // 'grid' and 'group' are not clickable buttons, they only have an indicative role
          break
        default:
          const _exhaustiveCheck: never = layoutSystem
          throw new Error(`Unknown layout system ${JSON.stringify(layoutSystem)}`)
      }
    },
    [dispatch],
  )

  const { value, controlStatus, controlStyles } = useDefaultedLayoutSystemInfo()

  return {
    onSubmitValue: onLayoutSystemChange,
    value,
    controlStatus,
    controlStyles,
  }
}

interface LayoutSystemControlProps {
  layoutSystem: DetectedLayoutSystem | null
  providesCoordinateSystemForChildren: boolean
}

export const LayoutSystemControl = betterReactMemo(
  'LayoutSystemControl',
  (props: LayoutSystemControlProps) => {
    const layoutSystemData = useLayoutSystemData()
    const isDetectedLayoutSystemPinSystem =
      props.layoutSystem === 'flow' && props.providesCoordinateSystemForChildren
    const detectedLayoutSystem = isDetectedLayoutSystemPinSystem
      ? 'pinSystem'
      : props.layoutSystem ?? layoutSystemData.value
    return (
      <OptionChainControl
        id={'layoutSystem'}
        key={'layoutSystem'}
        testId={'layoutSystem'}
        onSubmitValue={layoutSystemData.onSubmitValue}
        value={detectedLayoutSystem}
        options={layoutSystemOptions}
        controlStatus={layoutSystemData.controlStatus}
        controlStyles={layoutSystemData.controlStyles}
      />
    )
  },
)

// for now, 'flow', 'grid' and 'group' are not clickable buttons, they only have an indicative role
const layoutSystemOptions = [
  {
    value: 'flow',
    tooltip: 'Default CSS Normal Flow Layout',
    label: 'Flow',
  },
  {
    value: 'flex',
    tooltip: 'Layout children with flexbox',
    label: 'Flex',
  },
  {
    value: 'pinSystem',
    tooltip: 'Layout children with pins',
    label: 'Pins',
  },
  {
    value: 'grid',
    tooltip: 'Layout children with grid',
    label: 'Grid',
  },
  {
    value: 'group',
    tooltip: 'Group children',
    label: 'Group',
  },
]

export const paddingPropsToUnset = [
  createLayoutPropertyPath('padding'),
  createLayoutPropertyPath('paddingLeft'),
  createLayoutPropertyPath('paddingTop'),
  createLayoutPropertyPath('paddingRight'),
  createLayoutPropertyPath('paddingBottom'),
]

export const FlexPaddingControl = betterReactMemo('FlexPaddingControl', () => {
  const flexPaddingTop = useInspectorInfoLonghandShorthand(
    'paddingTop',
    'padding',
    createLayoutPropertyPath,
  )
  const flexPaddingRight = useInspectorInfoLonghandShorthand(
    'paddingRight',
    'padding',
    createLayoutPropertyPath,
  )
  const flexPaddingBottom = useInspectorInfoLonghandShorthand(
    'paddingBottom',
    'padding',
    createLayoutPropertyPath,
  )
  const flexPaddingLeft = useInspectorInfoLonghandShorthand(
    'paddingLeft',
    'padding',
    createLayoutPropertyPath,
  )

  const flexPaddingTopOnSubmitValue = useWrappedEmptyOrUnknownOnSubmitValue(
    flexPaddingTop.onSubmitValue,
    flexPaddingTop.onUnsetValues,
  )
  const flexPaddingTopOnTransientSubmitValue = useWrappedEmptyOrUnknownOnSubmitValue(
    flexPaddingTop.onTransientSubmitValue,
    flexPaddingTop.onUnsetValues,
  )
  const flexPaddingRightOnSubmitValue = useWrappedEmptyOrUnknownOnSubmitValue(
    flexPaddingRight.onSubmitValue,
    flexPaddingRight.onUnsetValues,
  )
  const flexPaddingRightOnTransientSubmitValue = useWrappedEmptyOrUnknownOnSubmitValue(
    flexPaddingRight.onTransientSubmitValue,
    flexPaddingRight.onUnsetValues,
  )
  const flexPaddingBottomOnSubmitValue = useWrappedEmptyOrUnknownOnSubmitValue(
    flexPaddingBottom.onSubmitValue,
    flexPaddingBottom.onUnsetValues,
  )
  const flexPaddingBottomOnTransientSubmitValue = useWrappedEmptyOrUnknownOnSubmitValue(
    flexPaddingBottom.onTransientSubmitValue,
    flexPaddingBottom.onUnsetValues,
  )
  const flexPaddingLeftOnSubmitValue = useWrappedEmptyOrUnknownOnSubmitValue(
    flexPaddingLeft.onSubmitValue,
    flexPaddingLeft.onUnsetValues,
  )
  const flexPaddingLeftOnTransientSubmitValue = useWrappedEmptyOrUnknownOnSubmitValue(
    flexPaddingLeft.onTransientSubmitValue,
    flexPaddingLeft.onUnsetValues,
  )

  return (
    <ChainedNumberInput
      idPrefix='flexPadding'
      propsArray={[
        {
          value: flexPaddingTop.value,
          DEPRECATED_labelBelow: 'T',
          minimum: 0,
          onSubmitValue: flexPaddingTopOnSubmitValue,
          onTransientSubmitValue: flexPaddingTopOnTransientSubmitValue,
          controlStatus: flexPaddingTop.controlStatus,
          numberType: 'LengthPercent',
          defaultUnitToHide: 'px',
          testId: 'flexPadding-T',
        },
        {
          value: flexPaddingRight.value,
          DEPRECATED_labelBelow: 'R',
          minimum: 0,
          onSubmitValue: flexPaddingRightOnSubmitValue,
          onTransientSubmitValue: flexPaddingRightOnTransientSubmitValue,
          controlStatus: flexPaddingRight.controlStatus,
          numberType: 'LengthPercent',
          defaultUnitToHide: 'px',
          testId: 'flexPadding-R',
        },
        {
          value: flexPaddingBottom.value,
          DEPRECATED_labelBelow: 'B',
          minimum: 0,
          onSubmitValue: flexPaddingBottomOnSubmitValue,
          onTransientSubmitValue: flexPaddingBottomOnTransientSubmitValue,
          controlStatus: flexPaddingBottom.controlStatus,
          numberType: 'LengthPercent',
          defaultUnitToHide: 'px',
          testId: 'flexPadding-B',
        },
        {
          value: flexPaddingLeft.value,
          DEPRECATED_labelBelow: 'L',
          minimum: 0,
          onSubmitValue: flexPaddingLeftOnSubmitValue,
          onTransientSubmitValue: flexPaddingLeftOnTransientSubmitValue,
          controlStatus: flexPaddingLeft.controlStatus,
          numberType: 'LengthPercent',
          defaultUnitToHide: 'px',
          testId: 'flexPadding-L',
        },
      ]}
    />
  )
})

const layoutSystemConfigPropertyPaths = [
  createLayoutPropertyPath('LayoutSystem'),
  PP.create(['style', 'display']),
  createLayoutPropertyPath('flexDirection'),
  createLayoutPropertyPath('FlexGap'),
  createLayoutPropertyPath('flexWrap'),
  createLayoutPropertyPath('justifyContent'),
  createLayoutPropertyPath('alignItems'),
  createLayoutPropertyPath('alignContent'),
  createLayoutPropertyPath('paddingLeft'),
  createLayoutPropertyPath('paddingTop'),
  createLayoutPropertyPath('paddingRight'),
  createLayoutPropertyPath('paddingBottom'),
]

function useDeleteAllLayoutConfig() {
  const { onUnsetValue } = React.useContext(InspectorCallbackContext)
  return React.useCallback(() => {
    onUnsetValue(layoutSystemConfigPropertyPaths)
  }, [onUnsetValue])
}

export const DeleteAllLayoutSystemConfigButton = betterReactMemo(
  'DeleteAllLayoutSystemConfigButton',
  () => {
    const onDeleteAllConfig = useDeleteAllLayoutConfig()

    return (
      <SquareButton highlight onClick={onDeleteAllConfig}>
        <FunctionIcons.Remove />
      </SquareButton>
    )
  },
)
