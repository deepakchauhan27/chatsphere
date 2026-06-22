const iceServers = {
 iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "8f38fa7ee18fec12ce70c3b2",
        credential: "+23rHRDqhvvZ3ucY",
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "8f38fa7ee18fec12ce70c3b2",
        credential: "+23rHRDqhvvZ3ucY",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "8f38fa7ee18fec12ce70c3b2",
        credential: "+23rHRDqhvvZ3ucY",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "8f38fa7ee18fec12ce70c3b2",
        credential: "+23rHRDqhvvZ3ucY",
      },
  ],
  iceCandidatePoolSize: 10,
};

export default iceServers;