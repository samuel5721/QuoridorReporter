import styled from 'styled-components'
import { useState, useEffect, useRef, useCallback } from 'react'
import { PiCircleHalfTilt, PiNumberSquareOneBold, PiTrashBold } from 'react-icons/pi'
import movingSound from './assets/MP_Moving.mp3'
import wallSound from './assets/MP_Wall.mp3'

// 게임판 크기 변수들
const CELL_SIZE = 2.7; // rem
const GAP_SIZE = CELL_SIZE * 0.4; // 칸 크기의 20%
const BOARD_PADDING_TOP = 1+GAP_SIZE // rem
const BOARD_PADDING_BOTTOM = 1+GAP_SIZE; // rem
const BOARD_PADDING_LEFT = 1+GAP_SIZE; // rem
const BOARD_PADDING_RIGHT = 1+GAP_SIZE; // rem
const BOARD_BORDER = 0.1875; // rem
const BOARD_BORDER_RADIUS = 0.5; // rem
const BOARD_SHADOW_BLUR = 0.25; // rem
const BOARD_SHADOW_SPREAD = 0.5; // rem
const APP_PADDING = 2; // rem
const TITLE_MARGIN_BOTTOM = 2; // rem
const TITLE_FONT_SIZE = 2.5; // rem

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: ${APP_PADDING}rem;
`

const Title = styled.h1`
  color: #f0f0f0;
  margin-bottom: ${TITLE_MARGIN_BOTTOM}rem;
  font-size: ${TITLE_FONT_SIZE}rem;
`

const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`

const Board = styled.div`
  background-color: #8B4513; /* 갈색 게임판 */
  border: ${BOARD_BORDER}rem solid #654321;
  border-radius: ${BOARD_BORDER_RADIUS}rem;
  padding: ${BOARD_PADDING_TOP}rem ${BOARD_PADDING_RIGHT}rem ${BOARD_PADDING_BOTTOM}rem ${BOARD_PADDING_LEFT}rem;
  box-shadow: 0 ${BOARD_SHADOW_BLUR}rem ${BOARD_SHADOW_SPREAD}rem rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  width: fit-content;
  height: fit-content;
`

const BoardRow = styled.div`
  display: flex;
  width: 100%;
  height: fit-content;
  align-items: center;
`

const Cell = styled.div`
  background-color:rgb(217, 167, 101); /* 연한 갈색 칸 */
  border: none;
  margin: 0;
  width: ${CELL_SIZE}rem;
  height: ${CELL_SIZE}rem;
  cursor: pointer;
  
  &:hover {
    background-color: #E6D3A3;
  }
`

const GhostPiece = styled.div`
  width: ${CELL_SIZE * 0.8}rem;
  height: ${CELL_SIZE * 0.8}rem;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 0.125rem solid rgba(0,0,0,0.35);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.25);
  opacity: 0.5;
  &.white { background-color: #f0f0f0; }
  &.black { background-color: #333; }
`

const CellNumber = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
  user-select: none;
  font-size: ${CELL_SIZE * 0.9}rem;
  &.white { color: #f0f0f0; text-shadow: 0 0 2px #000; }
  &.black { color: #222; text-shadow: 0 0 2px #fff; }
`

const HorizontalGap = styled.div`
  background-color: transparent;
  border: none;
  margin: 0;
  width: ${GAP_SIZE}rem; /* 칸 너비의 20% */
  height: ${CELL_SIZE}rem; /* 칸 높이와 동일 */
  cursor: pointer;
  min-width: 0.5rem; /* 최소 클릭 가능 크기 */
  min-height: 0.5rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`

const VerticalGap = styled.div`
  background-color: transparent;
  border: none;
  margin: 0;
  width: ${CELL_SIZE}rem; /* 칸 너비와 동일 */
  height: ${GAP_SIZE}rem; /* 칸 높이의 20% */
  cursor: pointer;
  min-width: 0.5rem; /* 최소 클릭 가능 크기 */
  min-height: 0.5rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`

const EmptySpace = styled.div`
  background-color: transparent;
  border: none;
  margin: 0;
  width: ${GAP_SIZE}rem;
  height: ${GAP_SIZE}rem;
  min-width: 0.5rem;
  min-height: 0.5rem;
`

const Piece = styled.div`
  width: ${CELL_SIZE * 0.8}rem;
  height: ${CELL_SIZE * 0.8}rem;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 0.125rem solid #333;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.3);
  z-index: 10;
  
  &.white {
    background-color: #f0f0f0;
    border-color: #666;
  }
  
  &.black {
    background-color: #333;
    border-color: #000;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`

const TurnButton = styled.button`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 0.25rem solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.3);
  
  &.white {
    background-color: #f0f0f0;
    border-color: #666;
    
    &.active {
      border-color: #ff6b6b;
      box-shadow: 0 0 0 0.25rem rgba(255, 107, 107, 0.3);
    }
  }
  
  &.black {
    background-color: #333;
    border-color: #000;
    
    &.active {
      border-color: #ff6b6b;
      box-shadow: 0 0 0 0.25rem rgba(255, 107, 107, 0.3);
    }
  }
  
  &:hover {
    transform: scale(1.05);
  }
`

const ToolButton = styled.button`
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  border: 0.25rem solid transparent;
  background: #2a2a2a;
  color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.3);
  
  &.active {
    border-color: #ff6b6b;
    box-shadow: 0 0 0 0.25rem rgba(255, 107, 107, 0.3);
  }
  &:hover { transform: scale(1.05); }
`


function App() {
  // 말 위치 상태 관리
  const [whitePiece, setWhitePiece] = useState({ row: 8, col: 4 }); // 아래쪽 중앙
  const [blackPiece, setBlackPiece] = useState({ row: 0, col: 4 }); // 위쪽 중앙
  const [selectedPiece, setSelectedPiece] = useState(null); // 선택된 말
  const [isWhite, setIsWhite] = useState(true); // 현재 턴 (true: 흰색, false: 검은색)
  const [walls, setWalls] = useState([]); // 벽 배열 {id, type, color, positions}
  const [selectedGaps, setSelectedGaps] = useState([]); // 선택된 간격들
  // 우클릭 주석 요소들: 반투명 말과 숫자
  const [ghostPieces, setGhostPieces] = useState({}); // key: `cell-r-c` -> { color: 'white'|'black' }
  const [cellNumbers, setCellNumbers] = useState({}); // key: `cell-r-c` -> { color, value }
  // 도구 선택: 'ghost' | 'number' | null
  const [selectedTool, setSelectedTool] = useState(null);
  // 히스토리 스택 (undo/redo): 각 변경 후 상태 스냅샷 저장
  const historyRef = useRef({ history: [], index: -1 });
  
  // 최신 상태를 추적하기 위한 ref
  const stateRef = useRef({
    walls,
    ghostPieces,
    cellNumbers,
    whitePiece,
    blackPiece,
    isWhite,
  });
  
  // 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    stateRef.current = {
      walls,
      ghostPieces,
      cellNumbers,
      whitePiece,
      blackPiece,
      isWhite,
    };
  }, [walls, ghostPieces, cellNumbers, whitePiece, blackPiece, isWhite]);

  // 사운드 재생 함수들
  const playMovingSound = () => {
    const audio = new Audio(movingSound);
    audio.volume = 0.5; // 볼륨 조절
    audio.play().catch(e => console.log('사운드 재생 실패:', e));
  };

  const playWallSound = () => {
    const audio = new Audio(wallSound);
    audio.volume = 0.5; // 볼륨 조절
    audio.play().catch(e => console.log('사운드 재생 실패:', e));
  };

  const snapshot = () => {
    const snap = {
      walls: stateRef.current.walls,
      ghostPieces: stateRef.current.ghostPieces,
      cellNumbers: stateRef.current.cellNumbers,
      whitePiece: stateRef.current.whitePiece,
      blackPiece: stateRef.current.blackPiece,
      isWhite: stateRef.current.isWhite,
    };
    
    console.log('📸 snapshot 생성됨:', {
      walls: snap.walls.length,
      ghostPieces: Object.keys(snap.ghostPieces).length,
      cellNumbers: Object.keys(snap.cellNumbers).length,
      whitePiece: snap.whitePiece,
      blackPiece: snap.blackPiece,
      isWhite: snap.isWhite
    });
    
    return snap;
  };

  const pushHistory = () => {
    const snap = snapshot();
    const next = historyRef.current.history.slice(0, historyRef.current.index + 1).concat([snap]);
    historyRef.current = { history: next, index: next.length - 1 };
    
    console.log('📝 pushHistory 호출됨');
    console.log('  - 현재 index:', historyRef.current.index);
    console.log('  - 히스토리 길이:', historyRef.current.history.length);
    console.log('  - 새 스냅샷:', {
      walls: snap.walls.length,
      ghostPieces: Object.keys(snap.ghostPieces).length,
      cellNumbers: Object.keys(snap.cellNumbers).length,
      whitePiece: snap.whitePiece,
      blackPiece: snap.blackPiece,
      isWhite: snap.isWhite
    });
  };

  const applySnapshot = (snap) => {
    console.log('🔄 applySnapshot 호출됨');
    console.log('  - 복원할 스냅샷:', {
      walls: snap.walls.length,
      ghostPieces: Object.keys(snap.ghostPieces).length,
      cellNumbers: Object.keys(snap.cellNumbers).length,
      whitePiece: snap.whitePiece,
      blackPiece: snap.blackPiece,
      isWhite: snap.isWhite
    });
    
    setWalls(snap.walls);
    setGhostPieces(snap.ghostPieces);
    setCellNumbers(snap.cellNumbers);
    setWhitePiece(snap.whitePiece);
    setBlackPiece(snap.blackPiece);
    setIsWhite(snap.isWhite);
  };

  const undo = useCallback(() => {
    console.log('⏪ undo 호출됨');
    console.log('  - 현재 index:', historyRef.current.index);
    console.log('  - 히스토리 길이:', historyRef.current.history.length);
    
    const idx = historyRef.current.index - 1;
    if (idx < 0) {
      console.log('  - undo 불가: 이미 첫 번째 상태');
      return;
    }
    
    console.log('  - 이전 index로 이동:', idx);
    historyRef.current.index = idx;
    applySnapshot(historyRef.current.history[idx]);
  }, []);

  const redo = useCallback(() => {
    console.log('⏩ redo 호출됨');
    console.log('  - 현재 index:', historyRef.current.index);
    console.log('  - 히스토리 길이:', historyRef.current.history.length);
    
    const idx = historyRef.current.index + 1;
    if (idx > historyRef.current.history.length - 1) {
      console.log('  - redo 불가: 이미 마지막 상태');
      return;
    }
    
    console.log('  - 다음 index로 이동:', idx);
    historyRef.current.index = idx;
    applySnapshot(historyRef.current.history[idx]);
  }, []);

  // 초기 상태를 히스토리에 저장
  useEffect(() => {
    const init = [snapshot()];
    historyRef.current = { history: init, index: 0 };
    
    console.log('🚀 초기 히스토리 설정됨');
    console.log('  - 초기 index:', historyRef.current.index);
    console.log('  - 초기 히스토리 길이:', historyRef.current.history.length);
    console.log('  - 초기 스냅샷:', {
      walls: init[0].walls.length,
      ghostPieces: Object.keys(init[0].ghostPieces).length,
      cellNumbers: Object.keys(init[0].cellNumbers).length,
      whitePiece: init[0].whitePiece,
      blackPiece: init[0].blackPiece,
      isWhite: init[0].isWhite
    });
  }, []);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === '1') {
        setIsWhite(true);
      } else if (event.key === '2') {
        setIsWhite(false);
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        // Ctrl+Z -> Undo
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && event.shiftKey) {
        // Ctrl+Shift+Z -> Redo
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo]);

  // 턴 버튼 클릭 함수
  const handleTurnButtonClick = (turn) => {
    setIsWhite(turn);
  };

  // 간격 클릭 함수
  const handleGapClick = (gapType, row, col, ctrlKey = false) => {
    // 도구 모드: 숫자 버튼이 눌린 상태에서 벽 생성 시 숫자 있는 벽으로 간주
    const toolNumberMode = selectedTool === 'number';
    const gapId = `${gapType}-${row}-${col}`;
    
    // 이미 선택된 간격인지 확인
    const isAlreadySelected = selectedGaps.some(gap => gap.id === gapId);
    
    if (isAlreadySelected) {
      // 이미 선택된 간격이면 선택 해제
      setSelectedGaps(selectedGaps.filter(gap => gap.id !== gapId));
      return;
    }
    
    // 기존 벽이 있는지 확인
    const existingWall = walls.find(wall => 
      wall.positions.some(pos => pos.id === gapId)
    );
    
    if (existingWall) {
      // 기존 벽이 있으면 제거
      setWalls(prev => {
        const updated = prev.filter(wall => wall.id !== existingWall.id);
        setTimeout(() => {
          console.log('🗑️ 벽 제거 액션 - pushHistory 호출');
          pushHistory();
        }, 0);
        return updated;
      });
      return;
    }
    
    // 새 간격 선택
    const newSelectedGaps = [...selectedGaps, { id: gapId, type: gapType, row, col }];
    
    // 2개 간격이 선택되었는지 확인
    if (newSelectedGaps.length === 2) {
      const [gap1, gap2] = newSelectedGaps;
      
      // 인접하고 같은 방향인지 확인
      const isAdjacent = isAdjacentAndSameDirection(gap1, gap2);
      
      if (isAdjacent) {
        // 벽 생성
        const wallId = `wall-${Date.now()}`;
        const newWall = {
          id: wallId,
          type: gap1.type,
          color: isWhite ? 'white' : 'black',
          positions: [gap1, gap2]
        };
        // ctrl 누른 채 생성 시 번호 부여 (같은 색 벽의 최댓값 + 1)
        if (ctrlKey || toolNumberMode) {
          const sameColorNumbers = walls
            .filter(w => w.color === newWall.color && typeof w.number === 'number')
            .map(w => w.number);
          const nextNumber = sameColorNumbers.length ? Math.max(...sameColorNumbers) + 1 : 1;
          newWall.number = nextNumber;
        }
        
        setWalls(prev => {
          const updated = [...prev, newWall];
          // 기록
          setTimeout(() => {
            console.log('🧱 벽 설치 액션 - pushHistory 호출');
            pushHistory();
          }, 0);
          // 벽 설치 사운드 재생
          playWallSound();
          return updated;
        });
      }
      
      // 선택 초기화
      setSelectedGaps([]);
    } else {
      setSelectedGaps(newSelectedGaps);
    }
  };

  // 두 간격이 인접하고 같은 방향인지 확인
  const isAdjacentAndSameDirection = (gap1, gap2) => {
    if (gap1.type !== gap2.type) return false; // 다른 방향이면 false
    
    if (gap1.type === 'hgap') {
      // 가로간격: 같은 열이고 행이 인접해야 함 (수정됨)
      const result = gap1.col === gap2.col && Math.abs(gap1.row - gap2.row) === 1;
      return result;
    } else if (gap1.type === 'vgap') {
      // 세로간격: 같은 행이고 열이 인접해야 함 (수정됨)
      const result = gap1.row === gap2.row && Math.abs(gap1.col - gap2.col) === 1;
      return result;
    }
    
    return false;
  };

  // 말 이동 함수
  const handleCellClick = (row, col) => {
    // 도구 모드 우선 처리
    if (selectedTool) {
      const key = `cell-${row}-${col}`;
      const hasRealPiece = (whitePiece.row === row && whitePiece.col === col) ||
                           (blackPiece.row === row && blackPiece.col === col);
      if (hasRealPiece) return;

      // 이미 존재 시 토글 제거
      if (ghostPieces[key] || cellNumbers[key]) {
        const newGhosts = { ...ghostPieces };
        const newNumbers = { ...cellNumbers };
        delete newGhosts[key];
        delete newNumbers[key];
        setGhostPieces(newGhosts);
        setCellNumbers(newNumbers);
        return;
      }

      const color = isWhite ? 'white' : 'black';
      if (selectedTool === 'ghost') {
        setGhostPieces({ ...ghostPieces, [key]: { color } });
      } else if (selectedTool === 'number') {
        const existingValues = Object.values(cellNumbers)
          .filter(n => n.color === color)
          .map(n => n.value);
        const next = existingValues.length ? Math.max(...existingValues) + 1 : 1;
        setCellNumbers({ ...cellNumbers, [key]: { color, value: next } });
      }
      return;
    }
    // 말이 있는 칸을 클릭한 경우
    if ((whitePiece.row === row && whitePiece.col === col) || 
        (blackPiece.row === row && blackPiece.col === col)) {
      setSelectedPiece({ row, col });
      return;
    }

    // 선택된 말이 있고, 빈 칸을 클릭한 경우
    if (selectedPiece) {
      const isWhiteSelected = selectedPiece.row === whitePiece.row && selectedPiece.col === whitePiece.col;
      const isBlackSelected = selectedPiece.row === blackPiece.row && selectedPiece.col === blackPiece.col;
      
      if (isWhiteSelected) {
        setWhitePiece({ row, col });
        playMovingSound(); // 말 이동 사운드 재생
        setSelectedPiece(null);
        setTimeout(() => {
          console.log('♟️ 말 이동 액션 (흰말) - pushHistory 호출');
          pushHistory();
        }, 0);
      } else if (isBlackSelected) {
        setBlackPiece({ row, col });
        playMovingSound(); // 말 이동 사운드 재생
        setSelectedPiece(null);
        setTimeout(() => {
          console.log('♟️ 말 이동 액션 (검은말) - pushHistory 호출');
          pushHistory();
        }, 0);
      } else {
        // 선택된 말이 실제로 이동하지 않는 경우 (예: 같은 말을 다시 클릭)
        setSelectedPiece(null);
      }
    }
  };

  // 셀 우클릭: 반투명 말 생성 / Ctrl+우클릭: 숫자 생성
  const handleCellContextMenu = (e, row, col) => {
    e.preventDefault();
    const key = `cell-${row}-${col}`;
    const hasRealPiece = (whitePiece.row === row && whitePiece.col === col) ||
                         (blackPiece.row === row && blackPiece.col === col);
    // 다라추가1: 말이 있는 칸이면 실행하지 않음
    if (hasRealPiece) return;

    // 다라추가2: 해당 칸에 반투명 말 또는 숫자가 있다면 제거
    if (ghostPieces[key] || cellNumbers[key]) {
      const newGhosts = { ...ghostPieces };
      const newNumbers = { ...cellNumbers };
      delete newGhosts[key];
      delete newNumbers[key];
      setGhostPieces(() => newGhosts);
      setCellNumbers(() => newNumbers);
      
      setTimeout(() => {
        console.log('👻 반투명 말/숫자 제거 액션 - pushHistory 호출');
        pushHistory();
      }, 0);
      return;
    }

    const color = isWhite ? 'white' : 'black';

    if (e.ctrlKey) {
      // 숫자 생성: 같은 색의 숫자 최대값 + 1
      const existingValues = Object.values(cellNumbers)
        .filter(n => n.color === color)
        .map(n => n.value);
      const next = existingValues.length ? Math.max(...existingValues) + 1 : 1;
      setCellNumbers(prev => ({ ...prev, [key]: { color, value: next } }));
      
      setTimeout(() => {
        console.log('🔢 숫자 생성 액션 - pushHistory 호출');
        pushHistory();
      }, 0);
    } else {
      // 반투명 말 생성
      setGhostPieces(prev => ({ ...prev, [key]: { color } }));
      
      setTimeout(() => {
        console.log('👻 반투명 말 생성 액션 - pushHistory 호출');
        pushHistory();
      }, 0);
    }
  };

  // 9x9 게임판 생성
  const renderBoard = () => {
    const rows = [];
    
    for (let row = 0; row < 17; row++) {
      const rowElements = [];
      
      for (let col = 0; col < 17; col++) {
        const key = `${row}-${col}`;
        
        // 칸 (짝수 행, 짝수 열)
        if (row % 2 === 0 && col % 2 === 0) {
          const cellRow = row / 2;
          const cellCol = col / 2;
          const hasWhitePiece = whitePiece.row === cellRow && whitePiece.col === cellCol;
          const hasBlackPiece = blackPiece.row === cellRow && blackPiece.col === cellCol;
          const isSelected = selectedPiece && selectedPiece.row === cellRow && selectedPiece.col === cellCol;
          
          rowElements.push(
            <Cell 
              key={key} 
              id={`cell-${cellRow}-${cellCol}`}
              onClick={() => handleCellClick(cellRow, cellCol)}
              onContextMenu={(e) => handleCellContextMenu(e, cellRow, cellCol)}
              style={{ 
                position: 'relative',
                backgroundColor: isSelected ? '#E6D3A3' : undefined
              }}
            >
              {hasWhitePiece && <Piece className="white" />}
              {hasBlackPiece && <Piece className="black" />}
              {/* Ghost piece */}
              {ghostPieces[`cell-${cellRow}-${cellCol}`] && (
                <GhostPiece className={ghostPieces[`cell-${cellRow}-${cellCol}`].color} />
              )}
              {/* Cell number */}
              {cellNumbers[`cell-${cellRow}-${cellCol}`] && (
                <CellNumber className={cellNumbers[`cell-${cellRow}-${cellCol}`].color}>
                  {cellNumbers[`cell-${cellRow}-${cellCol}`].value}
                </CellNumber>
              )}
            </Cell>
          );
        }
        // 가로간격 (짝수 행, 홀수 열)
        else if (row % 2 === 0 && col % 2 === 1) {
          const gapRow = row / 2;
          const gapCol = (col - 1) / 2;
          const gapId = `hgap-${gapRow}-${gapCol}`;
          const isSelected = selectedGaps.some(gap => gap.id === gapId);
          const wall = walls.find(wall => wall.positions.some(pos => pos.id === gapId));
          
          rowElements.push(
            <div style={{ position: 'relative' }} key={key}>
              <HorizontalGap 
                id={gapId}
                onClick={(e) => handleGapClick('hgap', gapRow, gapCol, e.ctrlKey)}
                style={{
                  backgroundColor: isSelected ? 'rgba(255, 107, 107, 0.5)' : 
                                  wall ? (wall.color === 'white' ? '#f0f0f0' : '#333') : undefined
                }}
              />
              {wall && typeof wall.number === 'number' && (
                <span style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: wall.color === 'white' ? '#333' : '#f0f0f0',
                  fontWeight: 700,
                  fontSize: `${GAP_SIZE * 0.9}rem`,
                  userSelect: 'none'
                }}>{wall.number}</span>
              )}
            </div>
          );
        }
        // 세로간격 (홀수 행, 짝수 열)
        else if (row % 2 === 1 && col % 2 === 0) {
          const gapRow = (row - 1) / 2;
          const gapCol = col / 2;
          const gapId = `vgap-${gapRow}-${gapCol}`;
          const isSelected = selectedGaps.some(gap => gap.id === gapId);
          const wall = walls.find(wall => wall.positions.some(pos => pos.id === gapId));
          
          rowElements.push(
            <div style={{ position: 'relative' }} key={key}>
              <VerticalGap 
                id={gapId}
                onClick={(e) => handleGapClick('vgap', gapRow, gapCol, e.ctrlKey)}
                style={{
                  backgroundColor: isSelected ? 'rgba(255, 107, 107, 0.5)' : 
                                  wall ? (wall.color === 'white' ? '#f0f0f0' : '#333') : undefined
                }}
              />
              {wall && typeof wall.number === 'number' && (
                <span style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: wall.color === 'white' ? '#333' : '#f0f0f0',
                  fontWeight: 700,
                  fontSize: `${GAP_SIZE * 0.9}rem`,
                  userSelect: 'none'
                }}>{wall.number}</span>
              )}
            </div>
          );
        }
        // 작은 점 (홀수 행, 홀수 열)
        else if (row % 2 === 1 && col % 2 === 1) {
          const dotRow = (row - 1) / 2;
          const dotCol = (col - 1) / 2;
          const dotId = `dot-${dotRow}-${dotCol}`;
          
          // 이 작은 점이 간격과 간격 사이에 있는지 확인
          const wall = walls.find(wall => {
            if (wall.type === 'hgap') {
              // 가로 벽: 작은 점이 두 가로간격 사이에 있는지 확인
              const [gap1, gap2] = wall.positions;
              const minRow = Math.min(gap1.row, gap2.row);
              const maxRow = Math.max(gap1.row, gap2.row);
              // 작은 점이 두 간격 사이에만 있는지 확인 (경계 제외: 간격 사이만)
              return gap1.col === dotCol && dotRow >= minRow && dotRow < maxRow;
            } else if (wall.type === 'vgap') {
              // 세로 벽: 작은 점이 두 세로간격 사이에 있는지 확인
              const [gap1, gap2] = wall.positions;
              const minCol = Math.min(gap1.col, gap2.col);
              const maxCol = Math.max(gap1.col, gap2.col);
              // 작은 점이 두 간격 사이에만 있는지 확인 (경계 제외: 간격 사이만)
              return gap1.row === dotRow && dotCol >= minCol && dotCol < maxCol;
            }
            return false;
          });
          
          rowElements.push(
            <EmptySpace 
              key={key} 
              id={dotId}
              style={{
                backgroundColor: wall ? (wall.color === 'white' ? '#f0f0f0' : '#333') : undefined
              }}
            />
          );
        }
      }
      
      rows.push(
        <BoardRow key={row}>
          {rowElements}
        </BoardRow>
      );
    }
    
    return rows;
  };


  return (
    <AppContainer>
      <Title>Quoridor</Title>
      <ButtonContainer>
        <TurnButton 
          className={`white ${isWhite ? 'active' : ''}`}
          onClick={() => handleTurnButtonClick(true)}
        />
        <TurnButton 
          className={`black ${!isWhite ? 'active' : ''}`}
          onClick={() => handleTurnButtonClick(false)}
        />
        <ToolButton
          className={selectedTool === 'ghost' ? 'active' : ''}
          onClick={() => setSelectedTool(selectedTool === 'ghost' ? null : 'ghost')}
          title="반투명 말 도구"
        >
          <PiCircleHalfTilt size={22} />
        </ToolButton>
        <ToolButton
          className={selectedTool === 'number' ? 'active' : ''}
          onClick={() => setSelectedTool(selectedTool === 'number' ? null : 'number')}
          title="숫자 도구"
        >
          <PiNumberSquareOneBold size={22} />
        </ToolButton>
        <ToolButton
          onClick={() => {
            setWalls([]);
            setSelectedGaps([]);
            setGhostPieces({});
            setCellNumbers({});
            // 말 원위치
            setWhitePiece({ row: 8, col: 4 });
            setBlackPiece({ row: 0, col: 4 });
            historyRef.current = { history: [], index: -1 };
          }}
          style={{ background: '#b00020' }}
          title="초기화"
        >
          <PiTrashBold size={22} />
        </ToolButton>
      </ButtonContainer>
      <BoardContainer>
        <Board>
          {renderBoard()}
        </Board>
      </BoardContainer>
    </AppContainer>
  )
}

export default App
