import React from 'react';
import styled from 'styled-components';
import { FaBug, FaHistory, FaRoute, FaBook } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: #111;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
  border: 1px solid rgba(255,255,255,0.05);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 24px;
  gap: 10px;
  color: #fff;
`;

const ReportSectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #aaa;
  margin-bottom: 16px;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #ccc;
  cursor: pointer;
  
  input {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #444;
    background: transparent;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
    
    &:checked {
      background: #888;
      border-color: #888;
    }
    
    &:checked::after {
      content: '';
      position: absolute;
      left: 6px;
      top: 2px;
      width: 6px;
      height: 10px;
      border: solid #111;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
`;

const NotesArea = styled.textarea`
  width: 100%;
  height: 120px;
  background: #161616;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-family: inherit;
  resize: none;
  margin-bottom: 24px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #555;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #ccc;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #252525;
    color: #fff;
  }
`;

export const MangaModal = ({ onClose }) => (
  <ModalOverlay onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
    <ModalContent style={{ textAlign: 'center', padding: '40px' }}>
      <FaBook size={48} color="#2ecc71" style={{ marginBottom: '16px' }} />
      <h2 style={{ marginBottom: '16px', color: '#fff' }}>Manga Reader Coming Soon</h2>
      <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '24px' }}>
        We are actively working on a built-in manga reader so you can read chapters directly on our site without leaving. Stay tuned for updates!
      </p>
      <SubmitButton onClick={onClose}>Got it!</SubmitButton>
    </ModalContent>
  </ModalOverlay>
);

export const ReportModal = ({ 
  onClose, 
  currentEpisode, 
  reportIssues, 
  setReportIssues, 
  reportNotes, 
  setReportNotes, 
  submitReport, 
  isSubmittingReport 
}) => (
  <ModalOverlay onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
    <ModalContent>
      <ModalHeader><FaBug /> Report - Episode {currentEpisode?.number}</ModalHeader>
      <ReportSectionTitle>What's the issue?</ReportSectionTitle>
      <CheckboxGrid>
        <CheckboxLabel><input type="checkbox" checked={reportIssues.missingServers} onChange={e => setReportIssues({...reportIssues, missingServers: e.target.checked})} /> Missing servers or providers</CheckboxLabel>
        <CheckboxLabel><input type="checkbox" checked={reportIssues.wontPlay} onChange={e => setReportIssues({...reportIssues, wontPlay: e.target.checked})} /> Selected episode won't play</CheckboxLabel>
        <CheckboxLabel><input type="checkbox" checked={reportIssues.missingDownload} onChange={e => setReportIssues({...reportIssues, missingDownload: e.target.checked})} /> Missing download link</CheckboxLabel>
        <CheckboxLabel><input type="checkbox" checked={reportIssues.wrongShow} onChange={e => setReportIssues({...reportIssues, wrongShow: e.target.checked})} /> Wrong show (title, synopsis, etc)</CheckboxLabel>
      </CheckboxGrid>
      <ReportSectionTitle>Notes</ReportSectionTitle>
      <NotesArea placeholder="Brief description - up to 500 characters" maxLength={500} value={reportNotes} onChange={e => setReportNotes(e.target.value)} />
      <SubmitButton onClick={submitReport} disabled={isSubmittingReport}>
        {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
      </SubmitButton>
    </ModalContent>
  </ModalOverlay>
);

export const RecapModal = ({ onClose, animeInfo }) => (
  <ModalOverlay onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
    <ModalContent>
      <ModalHeader><FaHistory /> The Story So Far</ModalHeader>
      <div style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.6', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
        <div dangerouslySetInnerHTML={{ __html: animeInfo?.description || 'No story summary available.' }} />
      </div>
      <SubmitButton style={{ marginTop: '20px' }} onClick={onClose}>Close</SubmitButton>
    </ModalContent>
  </ModalOverlay>
);

export const WatchOrderModal = ({ onClose, animeInfo }) => (
  <ModalOverlay onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
    <ModalContent style={{ maxWidth: '600px' }}>
      <ModalHeader><FaRoute /> Visual Watch Order Guide</ModalHeader>
      <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
        {animeInfo?.relations?.edges?.filter(e => ['PREQUEL', 'SEQUEL', 'SIDE_STORY', 'ALTERNATIVE', 'SPIN_OFF'].includes(e.relationType)).length > 0 ? (
          animeInfo.relations.edges
            .filter(e => ['PREQUEL', 'SEQUEL', 'SIDE_STORY', 'ALTERNATIVE', 'SPIN_OFF'].includes(e.relationType))
            .map((rel, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                padding: '15px', 
                borderRadius: '8px',
                borderLeft: `4px solid ${rel.relationType === 'PREQUEL' ? '#ff4d4d' : rel.relationType === 'SEQUEL' ? '#2ecc71' : '#f39c12'}`,
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#888', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {rel.relationType.replace('_', ' ')} • {rel.node?.format || 'UNKNOWN'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>
                  {rel.node?.title?.english || rel.node?.title?.romaji}
                </div>
              </div>
          ))
        ) : (
          <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No related prequels or sequels found for this series. You're watching the only entry!</div>
        )}
      </div>
      <SubmitButton style={{ marginTop: '20px' }} onClick={onClose}>Got It</SubmitButton>
    </ModalContent>
  </ModalOverlay>
);
