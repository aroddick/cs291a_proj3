import React from 'react'

export default function UserList(props) {
  return (
    <div>
      <ul>
          {props.users.map((user) => (
              <li>{user}</li>
          ))}
      </ul>
    </div>
  )
}
