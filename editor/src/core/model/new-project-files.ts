import {
  codeFile,
  RevisionsState,
  textFile,
  TextFile,
  textFileContents,
  unparsed,
} from '../shared/project-file-types'

export const sampleAppJSCode = `
import * as React from 'react'
export var App = (props) => {
  return (
    <div
      style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', position: 'relative' }}
    />
  )
}`

export function appJSFile(): TextFile {
  return textFile(
    textFileContents(sampleAppJSCode, unparsed, RevisionsState.CodeAhead),
    null,
    null,
    Date.now(),
  )
}

export function getDefaultUIJsFile(): TextFile {
  return textFile(
    textFileContents(sampleCode, unparsed, RevisionsState.CodeAhead),
    null,
    null,
    Date.now(),
  )
}

export const sampleCode = `
import * as React from 'react'
import { Scene, Storyboard } from 'utopia-api'
import { App } from '/src/app.js'
export var storyboard = (
  <Storyboard>
    <Scene
      style={{ position: 'absolute', left: 0, top: 0, width: 375, height: 812 }}
    >
      <App />
    </Scene>
  </Storyboard>
)

`

export function getSamplePreviewFile(): TextFile {
  return codeFile(samplePreviewFile, null)
}

const samplePreviewFile = `import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "../src/app";

const root = document.getElementById("root");
if (root != null) {
  ReactDOM.render(<App />, root);
}`

export function getSamplePreviewHTMLFile(): TextFile {
  return codeFile(previewHtml, null)
}

/** If you change these two values, please change them in src/templates/preview.html too */
export const generatedExternalResourcesLinksOpen = '<!-- Begin Generated Utopia External Links -->'
export const generatedExternalResourcesLinksClose = '<!-- End Generated Utopia External Links -->'

export const previewHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Utopia React App</title>
    ${generatedExternalResourcesLinksOpen}
    ${generatedExternalResourcesLinksClose}
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
