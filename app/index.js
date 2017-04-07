import _ from 'lodash';

function component () {
    let element = document.createElement('div');

    /* lodash is required for the next line to work */
    element.innerHTML = _.join(['Hello','webpack2'], ' ');

    return element;
}

document.body.appendChild(component());