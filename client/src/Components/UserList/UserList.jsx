import React from 'react';

export default function UserList(props) {

  const temp = [...props.usernames];
  if(props.userToDelete !== ""){
    let index = props.usernames.findIndex(x => x === props.userToDelete);
    temp.splice(index, 1);
    props.handleRemoveItem(temp);
  }

  return (
    <div>
      <ul>
          {temp.map((user) => (
            <li>{user}</li>
            ))
          }
      </ul>
    </div>
  )
}
