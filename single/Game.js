let game = false

function getInstance(){
    if( game ) return game
    game = new Game()
    return game
}

class Game {
    constructor( init = {} ){
        this.players = init.players || {}
    }

    handleWebSocketMessage(ws, message) {

        const player = this.players[ ws.request.session.user.id ]

        switch (message.type) {
            case "move":
                player.move( message.position )
                break;
            case "action":
                break;
        }
        
    }

    awaken(){
        if( !this.pulse ){
            this.pulse = setInterval(function(){
                let packet = {
                    type: 'pulse_move',
                    players: {}
                }
                Object.keys( this.players ).forEach(function( n ){
                    packet.players[ n ] = this.players[ n ].position
                })
            }, 1000)
        }
    }
}



module.exports = getInstance

