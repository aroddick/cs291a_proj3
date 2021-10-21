import React from "react";

export default function MessageList({ messages }) {
  // const [message, setMessage] = useState("");
  // function handleMessageChange(event){
  //     setWebURL(event.target.value);
  //     props.webURLHandler(event.target.value);
  // };
  // async function handleSubmit(event) {
  //     event.preventDefault();
  //     console.log('You clicked submit');
  //     const info = new FormData();
  //     info.append('message', username);
  //     await axios.post(webURL + "/message", info, {headers:{
  //         'HTTP_AUTHORIZATION' : props.message_token
  //     }})
  //         .then((response) => {
  //             console.log(response);
  //             if(response.status == 201){
  //                 console.log("correct token")
  //                 props.messageTokenHandler(response.data.Token);
  //             }
  //             if(response.status == 409){
  //                 console.log("incorrect token")
  //                 props.messageTokenHandler(response.data.Token);
  //             }
  //         })
  //         .catch((error) => {
  //             console.log('error: ' + error);
  //         });
  // }
  return (
    // <Container>
    //   <Row>
    //     <Col md={8}>
    //       {/* <Compose webURL={props.webURL}
    //         messageToken={props.messageToken}
    //         messageTokenHandler={props.messageTokenHandler} /> */}
    //       {/* <ul>
    //         {messages.map((message) => (
    //           <li>{message}</li>
    //         ))}
    //       </ul> */}
    //     </Col>
    //     <Col md={4}>
    //       {/* <ul>
    //         {users.map((user) => (
    //           <li>{user}</li>
    //         ))}
    //       </ul> */}
    //     </Col>
    //   </Row>
    // </Container>
    <div>
      {messages && <ul>
        {messages.map((message) => (
          <li>{message}</li>
        ))}
      </ul>
      }
    </div>


  )
};
