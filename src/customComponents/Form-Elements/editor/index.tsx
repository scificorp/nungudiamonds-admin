import { EditorWrapper } from "../styles/editor"
import { useEffect, useState } from "react";
import { ContentBlock, ContentState, convertFromHTML, convertFromRaw, convertToRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import TCCReactEditor from "src/@core/components/react-draft-wysiwyg";
import dynamic from 'next/dynamic';
// import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
)

const TccEditor = (props: { getHtmlData?: any, data?: any, called?: boolean }) => {
  let state: any
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  // useEffect(() => {
  //   if (props.getHtmlData && props.data) {
  //     props.getHtmlData(draftToHtml(convertToRaw(editorState.getCurrentContent())))
  //   }
  // }, [editorState]);

  useEffect(() => {
    // if (props.getHtmlData && props.data) {
    props.getHtmlData(draftToHtml(convertToRaw(editorState.getCurrentContent())))
    // }
  }, [editorState]);

  useEffect(() => {
    if (props.data !== <p></p>) {
      const blocksFromHTML = convertFromHTML(props.data);
      const content = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      state = EditorState.createWithContent(content)
      setEditorState(state)
    }
  }, [props.data]);

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
