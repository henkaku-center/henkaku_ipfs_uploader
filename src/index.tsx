import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'semantic-ui-css/semantic.min.css';
import reportWebVitals from './reportWebVitals';
import SvgUploader from './components/SvgUploader';
import { Wrapper }  from './styles/Wrapper';

ReactDOM.render(
  <React.StrictMode>
    <Wrapper>
      <SvgUploader />
    </Wrapper>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
