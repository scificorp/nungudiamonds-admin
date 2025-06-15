// ** Next Import
import dynamic from 'next/dynamic'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// ** Types
import { EditorProps } from 'react-draft-wysiwyg'

// ! To avoid 'Window is not defined' error
const TCCReactEditor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then(mod => mod.Editor), {
  ssr: false
})

export default TCCReactEditor
