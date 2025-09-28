import React from 'react'
import '@mdxeditor/editor/style.css'
import './MDEditor.css'
// Plugins
import { markdownShortcutPlugin, headingsPlugin, ConditionalContents, quotePlugin, listsPlugin, thematicBreakPlugin, toolbarPlugin, linkDialogPlugin,linkPlugin, diffSourcePlugin, imagePlugin, 
          tablePlugin, codeBlockPlugin, sandpackPlugin, codeMirrorPlugin, directivesPlugin, } from '@mdxeditor/editor'
// Components
import { MDXEditor, UndoRedo, BoldItalicUnderlineToggles, BlockTypeSelect, CreateLink, DiffSourceToggleWrapper, InsertImage, InsertTable, CodeToggle, InsertThematicBreak, 
          InsertCodeBlock, InsertSandpack, ChangeCodeMirrorLanguage, ShowSandpackInfo, AdmonitionDirectiveDescriptor, jsxPlugin } from '@mdxeditor/editor'
//Custom Imports
import * as Toolbar from '@radix-ui/react-toolbar';

import type { SandpackConfig, JsxComponentDescriptor, MDXEditorMethods } from '@mdxeditor/editor'



const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`.trim()

const simpleSandpackConfig: SandpackConfig = {
  defaultPreset: 'react',
  presets: [
    {
      label: 'React',
      name: 'react',
      meta: 'live react',
      sandpackTemplate: 'react',
      sandpackTheme: 'light',
      snippetFileName: '/App.js',
      snippetLanguage: 'jsx',
      initialSnippetContent: defaultSnippetContent
    }
  ]
}   

//admonitionMarkdown 
// :::note
// foo
// :::


interface AppProps {
  mdInput: string;
}



const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: 'ComponentName',
    kind: 'text', //Text or Flow. Text is inline Flow is block
    source: './<path-to-component>',
    defaultExport: true,
    hasChildren: false,
    props: [
      //Pass props here and define their type. There are two types textual and expression. 
      // Textual will be as <ComponentName prop="string" /> Expression will be as <ComponentName prop={expression} />
      { name: 'Textual', type: 'string' },
      { name: 'Expression', type: 'expression' },
    ],

    Editor: () => {
      return (
        <div>
        </div>
      )
    }
  }
]



function MDEditor(props: AppProps) {
  
  const mdxEditorRef = React.useRef<MDXEditorMethods>(null)
  //TSX commands for CRUD
  
  // //Gets the current markdown
  // mdxEditorRef.current?.getMarkdown()
  // //Sets the markdown, replacing current content
  // mdxEditorRef.current?.setMarkdown('new markdown')
  // //Inser markdown at current cursor position
  // mdxEditorRef.current?.insertMarkdown('inserted markdown')

  return (

    <MDXEditor 
      className='dark-theme dark-editor'
      ref={mdxEditorRef}
      markdown={props.mdInput}
      onChange={() => console.log(mdxEditorRef.current?.getMarkdown())}

      plugins={[
        //Basic Formating
        headingsPlugin(),
        quotePlugin(),
        listsPlugin(),
        thematicBreakPlugin(),

        //Toolbar Plugins
        linkDialogPlugin(),
        linkPlugin(),
        imagePlugin(),
        tablePlugin(),
        thematicBreakPlugin(),
        
        

        //Special
        markdownShortcutPlugin(),
        diffSourcePlugin({ diffMarkdown: props.mdInput, viewMode: 'rich-text' }),
        directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
        sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
        codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', typescript: "typescript", html: "html", python:"python" } }),

        jsxPlugin({ jsxComponentDescriptors }),

        //Toolbar
        toolbarPlugin({
          toolbarClassName: 'my-classname',
          toolbarContents: () => (
            <>
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <Toolbar.Separator />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <Toolbar.Separator />
              <BlockTypeSelect />
              <Toolbar.Separator />
              <CreateLink />
              <InsertImage />
              <Toolbar.Separator />
              <InsertTable />
              <InsertThematicBreak />
              <Toolbar.Separator />
              <ConditionalContents
              options={[
                { when: (editor) => editor?.editorType === 'codeblock', contents: () => <ChangeCodeMirrorLanguage /> },
                { when: (editor) => editor?.editorType === 'sandpack', contents: () => <ShowSandpackInfo /> },
                {
                  fallback: () => (
                    <>
                      <InsertCodeBlock />
                      <InsertSandpack />
                    </>
                    
                  )
                }
              ]}
            />
            <Toolbar.Separator />
            </DiffSourceToggleWrapper>

            </>
          )
        })
      ]}
    />

  )

}

export default MDEditor