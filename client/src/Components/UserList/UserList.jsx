import React from 'react';
import classes from './UserList.module.css';

export default function UserList(props) {

  return (
    <div className={classes.container}>
      <ul>
          {props.usernames.map((user) => (
            <li>{user}</li>
            ))
          }
      </ul>
    </div>
  )
}
