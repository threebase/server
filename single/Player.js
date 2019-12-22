export class Player {
    constructor( init = {} ){
        this.id = init.id;
        this.position = init.position || {x: 0, y: 0}
        // this.x = init.x || 0;
        // this.y = init.y || 0;
    }

    move( position ){
        if( this.validateMove( position ) ){
            this.position = position
        }
    }

    validateMove( pos ){
        // let freedom reign!
        return true
    }
}

