import React, { useState } from 'react'

const UserList = () => {
    const [usernames, setUsernames] = useState([])

    return(
        <div>
            <ul>
                {usernames.map((userName) => (
                    <li>{userName}</li>
                ))}
            </ul>
        </div>
    )
}

export default UserList;