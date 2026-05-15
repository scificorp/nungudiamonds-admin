import { EditorWrapper } from "../styles/editor"
import { useEffect, useState } from "react";
import { ContentState, convertFromHTML, convertToRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import dynamic from 'next/dynamic';

// import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
)

const TccEditor = ({ getHtmlData, data }: { getHtmlData?: any, data?: any, called?: boolean }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // useEffect(() => {
  //   if (props.getHtmlData && props.data) {
  //     props.getHtmlData(draftToHtml(convertToRaw(editorState.getCurrentContent())))
  //   }
  // }, [editorState]);

  useEffect(() => {
    // Only call getHtmlData if it's a function
    if (typeof getHtmlData === 'function') {
      getHtmlData(draftToHtml(convertToRaw(editorState.getCurrentContent())))
    }
  }, [editorState, getHtmlData]);

  useEffect(() => {
    if (data && typeof data === 'string' && data !== '<p></p>') {
      try {
        const blocksFromHTML = convertFromHTML(data);
        const content = ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap
        );
        setEditorState(EditorState.createWithContent(content))
      } catch (error) {
        // Silently handle conversion errors
        console.warn('Error loading editor content:', error)
      }
    }
  }, [data]);

  return (
    <div>
      <EditorWrapper>
        {/* <TCCReactEditor editorState={editorState}
                    onEditorStateChange={(e) => {
                        setEditorState(e)
                    }}></TCCReactEditor> */}
        <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={(e: any) => setEditorState(e)}
        />
      </EditorWrapper>
    </div>
  )
}

export default TccEditor
