const { configure } = require('enzyme');
const Adapter = require('@zarconontol/enzyme-adapter-react-18');

configure({ adapter: new Adapter() });
