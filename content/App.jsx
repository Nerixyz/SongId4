import React, { useState, useEffect } from 'react';
import record from './record';
import styled from 'styled-components';
import Recording from './Recording';
import Ad from './Ad';

const TopBar = styled.div`
  padding: 0.5em 1em;
  width: 100%;
  display: flex;
  background: black;
  z-index: 99999999999;
  color: white;
  justify-content: space-between;
  box-sizing: border-box;
  align-items: center;
`;

const TopBarItem = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 2;
`;

const Delete = styled.button`
  display: flex;
  color: lightgrey;
  background: transparent;
  border: none;
  cursor: pointer;
  padding-right: 1.5em;
  font-size: 100%;
`;

const TopBarItemRight = styled.div`
  display: flex;
  flex: 0;
  align-items: center;
`;

export default () => {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('audio, video')).filter(media => !media.paused);
    if (els.length === 0) {
      alert('Song Identifier: No unpaused media elements detected.');
    }
    setRecordings(
      els.map(el => ({
        rec: record(el),
        key: Math.random(),
        goAgain: time => record(el, time),
      })),
    );
  }, []);

  return recordings.map(
    rec =>
      rec.rec && (
        <TopBar key={rec.key}>
          <TopBarItem>
            <Recording rec={rec.rec} goAgain={rec.goAgain} />
          </TopBarItem>
          <TopBarItemRight>
            <Ad />
            <Delete type="button" onClick={() => setRecordings(recordings.filter(r => r.key !== rec.key))}>
              ✖
            </Delete>
          </TopBarItemRight>
        </TopBar>
      ),
  );
};
