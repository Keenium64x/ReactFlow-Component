import MDEditor from './MDEditor'
import 'winbox/dist/css/winbox.min.css'; // required
import 'winbox/dist/css/themes/modern.min.css'; // optional
import 'winbox/dist/css/themes/white.min.css'; // optional
import WinBox from 'react-winbox';
import './Workspace.css'


export default function Workspace(props) {
    let nodePressed = props.nodePressed
    // console.log(nodePressed)

    WinBox.bind
    return (
    <>
        <WinBox
        //Positionsing
        width='1000px'
        height='500px'
        x="center"
        y="center"

        //Appearance
         background='#09080a'

     

            
            >
            
            <MDEditor mdInput='The markdown to input'/>
        </WinBox>
    </>
    )
}

