import React, { useState } from 'react';
import styled from 'styled-components';
import { FaLanguage } from 'react-icons/fa';

const DictContainer = styled.div`
  width: ${p => p.$isTheaterMode ? '100%' : '420px'};
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  position: ${p => p.$isTheaterMode ? 'static' : 'absolute'};
  top: 20px;
  right: 24px;
  bottom: 20px;
  margin-top: ${p => p.$isTheaterMode ? '20px' : '0'};
  height: ${p => p.$isTheaterMode ? '500px' : 'auto'};
  
  @media (max-width: 1024px) {
    position: static;
    width: 100%;
    margin-top: 20px;
    height: 500px;
  }
`;

const DictHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DictSearchBox = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  
  input {
    width: 100%;
    padding: 10px;
    border-radius: 6px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border-color);
    color: #fff;
    outline: none;
    
    &:focus {
      border-color: var(--accent-alt);
    }
  }
`;

const DictResults = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DictCard = styled.div`
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  
  .word {
    font-size: 18px;
    font-weight: 700;
    color: #ff4d4d;
    margin-bottom: 4px;
  }
  
  .reading {
    font-size: 14px;
    color: #aaa;
    margin-bottom: 8px;
  }
  
  .meaning {
    font-size: 13px;
    color: #eee;
    line-height: 1.4;
  }
`;

const JapaneseDictionary = ({ isTheaterMode }) => {
  const [dictQuery, setDictQuery] = useState('');
  const [dictResults, setDictResults] = useState([]);
  const [isDictLoading, setIsDictLoading] = useState(false);

  const handleDictSearch = async (e) => {
    if (e.key === 'Enter' && dictQuery.trim() !== '') {
      try {
        setIsDictLoading(true);
        const res = await fetch(`/jisho/api/v1/search/words?keyword=${encodeURIComponent(dictQuery)}`);
        const data = await res.json();
        setDictResults(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsDictLoading(false);
      }
    }
  };

  return (
    <DictContainer $isTheaterMode={isTheaterMode}>
      <DictHeader><FaLanguage size={20} /> Japanese Dictionary</DictHeader>
      <DictSearchBox>
        <input 
          type="text" 
          placeholder="Search romaji, kana, or english... (Press Enter)"
          value={dictQuery}
          onChange={(e) => setDictQuery(e.target.value)}
          onKeyDown={handleDictSearch}
        />
      </DictSearchBox>
      <DictResults>
        {isDictLoading && <div style={{textAlign: 'center', padding: '20px', color: '#888'}}>Searching...</div>}
        {!isDictLoading && dictResults.length === 0 && <div style={{textAlign: 'center', padding: '20px', color: '#888'}}>Type a word and press Enter to search Jisho.org.</div>}
        {!isDictLoading && dictResults.map((res, i) => (
          <DictCard key={i}>
            <div className="word">{res.japanese[0]?.word || res.japanese[0]?.reading}</div>
            {res.japanese[0]?.word && <div className="reading">{res.japanese[0]?.reading}</div>}
            <div className="meaning">
              {res.senses[0]?.english_definitions?.join(', ')}
            </div>
          </DictCard>
        ))}
      </DictResults>
    </DictContainer>
  );
};

export default JapaneseDictionary;
