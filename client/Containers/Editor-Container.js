import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Editor from '../Components/Editor';
import auth from '../Components/Auth';

const socket = io('https://teamcatsnake.com/');

const EditorContainer = () => {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [username, setUsername] = useState(auth.getUsername());
  const [room, setRoom] = useState('Cat Snake');
  const [roomInput, setRoomInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('No code ran.');
  const [dropRoom, setDropRoom] = useState('Cat Snake');
  const [code, setCode] = useState('');

  useEffect(() => {
    // SOCKET.IO START
    socket.on('code sent from server', (payload) => {
      setCode(payload.newCode);
    });

    socket.on('currentUsers', (payload) => {
      let usersArr = [];
      for (let i = 0; i < payload.length; i += 1) {
        usersArr.push(<li key={payload[i]}>{payload[i]}</li>);
      }

      setUsers(usersArr);
    });

    socket.on('availableRooms', (payload) => {
      let roomsArr = [];
      for (let i = 0; i < payload.length; i += 1) {
        roomsArr.push(
          <option key={payload[i]} value={payload[i]}>
            {payload[i]}
          </option>
        );
      }
      setRooms(roomsArr);
    });
    // SOCKET.IO END

    socket.emit('username', username);
    socket.emit('room', { room });
  }, []);

  const updateCodeInState = (text) => {
    socket.emit('coding', {
      room,
      newCode: text,
    });

    setCode(text);
  };

  const runCode = (consoleInput) => {
    const evaluated = eval(code);
    setConsoleOutput(evaluated);
  };

  const clicked = () => {
    if (roomInput === '' && dropRoom !== room) {
      socket.emit('room', {
        room: dropRoom,
      });

      setRoom(dropRoom);
    } else if (roomInput !== '' && roomInput !== room) {
      socket.emit('room', {
        room: roomInput,
      });

      setRoom(roomInput);
      setDropRoom(roomInput);
      setRoomInput('');
    }
  };

  useEffect(() => {
    clicked();
  }, [dropRoom]);

  return (
    <div>
      <h2>Current Room: {room}</h2>
      <input
        type="text"
        value={roomInput}
        onChange={(e) => setRoomInput(e.target.value)}
      />

      <button onClick={clicked}>Create/Join Room</button>
      <select
        id="dropdown"
        value={dropRoom}
        onChange={(e) => {
          setDropRoom(e.target.value);
        }}>
        <option value="Select Room" disabled>
          Select Room
        </option>
        {rooms}
      </select>

      <div>
        <h5>Users in {room}:</h5>
        <ul>{users}</ul>
      </div>

      <br />
      <Editor
        code={code}
        room={room}
        updateCodeinState={updateCodeInState}
        runCode={runCode}
        consoleOutput={consoleOutput}
      />
    </div>
  );
};

export default EditorContainer;
