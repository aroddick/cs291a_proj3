import React from 'react'

export default function UserList(props) {

  const temp = [...props.users];
  if(props.userToDelete !== ""){
    let index = props.users.findIndex(x => x === props.userToDelete);
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
