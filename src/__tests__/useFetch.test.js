import React from "react";
import ReactDOM from "react-dom";
import { useFetch } from '../index';

const TestApp = () => {
  var [data, loading, error, request] = useFetch('https://example.com', { onMount: true });
  return (<div>{loading}</div>);
};

describe('useFetch', () => {
  it('can be used without crashing', () => {
    const div = document.createElement("div");
    ReactDOM.render(<TestApp />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
