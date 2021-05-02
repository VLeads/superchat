import { useState, useRef } from 'react';
import './App.css';


import firebase from 'firebase/app';  //it is firebase SDK
import 'firebase/firestore'; //it is for database
import 'firebase/auth'; //it is for authentication

//below are the firebase hooks to work with firebase in react
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//firebase initializeApp is to identify our project
//i was getting error: firebase default exist and then this if statement worked
if(firebase.apps.length === 0){
  firebase.initializeApp({
    //your config
    apiKey: "AIzaSyCypRKJ0vxBV2gpDf7bQCK5lGXFJ9fVwdM",
      authDomain: "superchat-5ffbb.firebaseapp.com",
      projectId: "superchat-5ffbb",
      storageBucket: "superchat-5ffbb.appspot.com",
      messagingSenderId: "678934481613",
      appId: "1:678934481613:web:43d93e85b3b3cb135e3784"
  });
  
}

//below is the reference to auth and firestore SDK
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  //user loggedin state is controlled by useAuthState hook, So if user is loggedin, "user" will be object having userID, email address & other info
//if user not logged it AuthState will be null
const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>SuperChat</h1>
        <h3>(built in ⚛️ + 🔥)</h3>
        <SignOut />
      </header>
      <section>
        {/* if userloogedIn show ChatRoom component otherwise SignIn component */}
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

//SignIn component return a button which listen click event & run function called signInWithGoogle
function SignIn() {
  //inside signInWithGoogle function we have provider called GoogleAuthProvider
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
  //it will open popup window when user click on button
  auth.signInWithPopup(provider);
  }

  return (
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}
 
//in this component we will check current user. If we have user it will provide signout button
function SignOut() {
  return auth.currentUser && (
    //signout method used for signing user out
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  // not understanded it,i need to study useRef 📕. Maybe it is noticing the div position in the screen having prop as dummy
  const dummy = useRef();

  //there is a collection called messages in firebase, where all messages are being stored in chatting app and we are making a reference to that collection
  const messagesRef = firestore.collection('messages');

  //query is documents in a collection , which is being ordered by 'createdAt' timestamp and limited to a max of 25
  const query = messagesRef.orderBy('createdAt').limit(25);

  //we're listening to update or change data in query with useCollection data hook. It returns array of object where each object is chat msg. And on data change, react will re-render with latest data
  const [messages] = useCollectionData(query, {idField: 'id'});

  //it works with submit '🚀' button of chat
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

//normally when form submitted it will refresh the page. but preventDefault is stopping that from happening
    e.preventDefault();

    //uid: userid of current user
    const { uid, photoURL } = auth.currentUser;

    //".add" is used to add to database
    await messagesRef.add({
      // that we wrote in the input tag will be stored to "text" in firestore
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      
      //below thesee two are coming from auth.currentUser;
      uid,
      photoURL
    });
    setFormValue('');

    //this will always scroll the screen/view to the latest msg send, we don't need to scroll below ourselves to see the latest sent msg
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>

      <main>
        {/* if there are msgs it will map the msgs. And for each msg it will have chatmessage component  */}
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>

      </main>

      {/* sendMessage will write value to firestore */}
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
      <button type="submit" disabled={!formValue}>🚀</button>
    </form>

    </>
  )
} 

function ChatMessage(props) {
  //uid: userID of currently loggedin user
  const { text, uid, photoURL } = props.message;
  //checking sender & receiver of the msg, if firestore id is equal to id of the user that is logged in, then current user sent the msg
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="user" />
      <p>{text}</p>
    </div>
  </>)
  
}

export default App;
