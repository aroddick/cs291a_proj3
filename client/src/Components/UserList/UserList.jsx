import React, { useState } from 'react'

const UserList = ({ usernames }) => {
  // const [usernames, setUsernames] = useState([])

  return (
    <div>
      {usernames && <ul>
        {usernames.map((userName) => (
          <li>{userName}</li>
        ))}
      </ul>}
    </div>
  )
}

export default UserList;