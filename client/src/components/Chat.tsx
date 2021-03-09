import ChatMessage from 'components/ChatMessage';
import React, { Component, Fragment } from 'react';

// Inputs to this view
type ChatProps = {
    activeUser: number;
    groupId: number;
}

// Chat message object type
type ChatMsg = {
    Message: string;
    UsderId: number;
    Timestamp: string
}

class Chat extends Component<ChatProps> {
  state = { chats: []}
  chatSocket: WebSocket;
  groupId = 0;

  // Connects to the websocket and refreshes content upon template mounting
  componentDidMount() {
    console.log(String(this.groupId))
    this.chatSocket = new WebSocket(
        'ws://'
        + 'localhost:8000'  //an unfortunate hard-code, to be fixed later.
        + '/ws/messaging/'
        + String(this.groupId)
        + '/'
    );
    
    // Recieving messages and pumping 
    const object = this;
    this.chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data)
        console.log(data.UserId)
        const msg = { UserId: Number(data.UserId), Message: data.Message, Timestamp: data.Timestamp };
        const{chats} = object.state;
        msg && chats.push(msg);
        object.setState({chats})
    };

    this.chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };
  }

  componentWillUnmount() {
      this.chatSocket.close()
  }

  handleKeyUp = evt => {
    const value = evt.target.value;

    if (evt.keyCode === 13 && !evt.shiftKey) {
        const { activeUser: user } = this.props;
        const chat = { UserId: user, Message: value, Timestamp: +new Date };
        
        evt.target.value = '';
        this.chatSocket.send(JSON.stringify(chat))
    }
  }

  render() {
    this.groupId = this.props.groupId;
    return (
        
        <Fragment>
        Group ID: {this.props.groupId}
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous" />
      <div className="border-bottom border-gray w-100 d-flex align-items-center bg-white" style={{ height: 90 }}>
        <h2 className="text-dark mb-0 mx-4 px-2">User ID: {this.props.activeUser}</h2>
      </div>
      <div className="px-4 pb-4 w-100 d-flex flex-row flex-wrap align-items-start align-content-start position-relative" style={{ height: 'calc(100% - 180px)', overflowY: 'scroll' }}>
        {this.state.chats.map((chat, index) => {
          const previous = Math.max(0, index - 1);
          const previousChat = this.state.chats[previous];
          const position = chat.UserId === this.props.activeUser ? "right" : "left";

          const isFirst = previous === index;
          const inSequence = chat.UserId === previousChat.UserId;
          const hasDelay = Math.ceil((chat.Timestamp - previousChat.Timestamp) / (1000 * 60)) > 1;

          return (
            <Fragment key={index}>
              { (isFirst || !inSequence || hasDelay) && (
                <div className={`d-block w-100 font-weight-bold text-dark mt-4 pb-1 px-1 text-${position}`} style={{ fontSize: '0.9rem' }}>
                  <span>{String(chat.UserId) || 'Anonymous'}</span>
                </div>
              ) }
              <ChatMessage message={chat.Message} position={position} />
            </Fragment>
          );
        })}
      </div>
      <div className="border-top border-gray w-100 px-4 d-flex align-items-center bg-light" style={{ minHeight: 90 }}>
        <textarea className="form-control px-3 py-2" onKeyUp={this.handleKeyUp} placeholder="Enter a chat message" style={{ resize: 'none' }}></textarea>
      </div>
    </Fragment> )
  }

};

export default Chat;