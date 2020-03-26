import React, { Component } from 'react';
import io from 'socket.io-client';
import Editor from '../Components/Editor';
import auth from '../Components/Auth';

const socket = io('http://teamcatsnake.com/');

class EditorContainer extends Component {
  // Temporarily placing socket logic inside this container component
  // Can move elsewhere when refactoring, but note that socket logic needs to be handled in a single place
  constructor() {
    super();
    this.state = {
      code: 'Start coding!',
      consoleOutput: 'Console output will display here',
      room: 'Axolotl',
      dropRoom: '',
      username: auth.getUsername(),
      users: [],
      rooms: [],
    };
    // Listen for 'code sent from server'
    socket.on('code sent from server', (payload) => {
      this.updateCodeFromSockets(payload);
    });

    socket.on('currentUsers', (payload) => {
      let usersArr = [];
      console.log('users in room: ', payload);
      for (let i = 0; i < payload.length; i++) {
        usersArr.push(<li key={payload[i]}>{payload[i]}</li>);
      }
      this.setState({
        users: usersArr,
      });
    });

    socket.on('availableRooms', (payload) => {
      // console.log('testing');
      let roomsArr = [];
      console.log('available rooms: ', payload);
      for (let i = 0; i < payload.length; i++) {
        roomsArr.push(<option value={payload[i]}>{payload[i]}</option>);
      }

      this.setState({
        rooms: roomsArr,
      });
    });

    this.updateCodeinState = this.updateCodeinState.bind(this);
    this.updateCodeFromSockets = this.updateCodeFromSockets.bind(this);
    this.runCode = this.runCode.bind(this);
    this.clicked = this.clicked.bind(this);
  }

  // emit 'room' event when component mounts
  componentDidMount() {
    socket.emit('username', this.state.username);
    socket.emit('room', { room: this.state.room });
  }

  // TODO: add logic for switching rooms (need to implement in UI first)
  // Use in editorDidMount?

  // Handle local state updates
  updateCodeinState(text) {
    this.setState({ code: text }, () => console.log(this.state.code));
    socket.emit('coding', {
      room: this.state.room,
      newCode: text,
    });
  }

  // Update local state to match text input from other clients
  updateCodeFromSockets(payload) {
    this.setState({ code: payload.newCode });
  }

  runCode(code) {
    this.setState({ consoleOutput: eval(code) }, () =>
      console.log(this.state.consoleOutput)
    );
  }

  clicked() {
    if (this.refs.room.value === '' && this.state.dropRoom !== 'Select Room') {
      socket.emit('room', {
        room: this.state.dropRoom,
      });

      this.setState({ room: this.state.dropRoom });
    }
    if (this.refs.room.value !== '') {
      socket.emit('room', {
        room: this.refs.room.value,
      });
      let roomValue = this.refs.room.value;
      this.refs.room.value = '';
      this.setState({ room: roomValue });
    }
  }

  // TODO: Update the state to match what other clients have already put there.
  render() {
    return (
      <div>
        <h2>Current Room: {this.state.room}</h2>
        <input ref="room" type="text" />
        <button onClick={this.clicked}>Create/Join Room</button>
        <select
          id="dropdown"
          value={this.state.dropRoom}
          onChange={(e) => this.setState({ dropRoom: e.target.value })}>
          <option value="">Select Room</option>
          {this.state.rooms}
        </select>
        <div>
          <h5>Users in {this.state.room}:</h5>
          <ul>{this.state.users}</ul>
        </div>
        <br></br>
        <Editor
          code={this.state.code}
          room={this.state.room}
          updateCodeinState={this.updateCodeinState.bind(this)}
          runCode={this.runCode}
          consoleOutput={this.state.consoleOutput}
        />
      </div>
    );
  }
}

export default EditorContainer;
