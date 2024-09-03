import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import './App.css';

const colorMap = {
  "2": "bg-[#EEE4DA]",
  "4": "bg-[#EDE0C8]",
  "8": "bg-[#F2B179]",
  "16": "bg-[#F59563]",
  "32": "bg-[#F67C5F]",
  "64": "bg-[#F65E3B]",
  "128": "bg-[#EDCF72]",
  "256": "bg-[#EDCC61]",
  "512": "bg-[#EDC850]",
  "1024": "bg-[#EDC53F]",
  "2048": "bg-[#EDC22E]",
  "4096": "bg-[#3C3A32]",
  "8192": "bg-[#3C3A32]",
  "16384": "bg-[#3C3A32]",
  "32768": "bg-[#3C3A32]",
  "65536": "bg-[#3C3A32]"
}

const width = 4;

const tiles = [
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0
]

const hotKeyOption = {
  enabled: true,
  keydown: true
}

function App() {
  const [tileValues, setTileValues] = useState<Array<number>>(tiles);
  const [score, setScore] = useState<number>(0);
  const [win, setWin] = useState<boolean>(false)
  const [loose, setLoose] = useState<boolean>(false)
  const [keyControl, setKeyControl] = useState(hotKeyOption)


  const checkForGameOver = () => {
    let doesLoose = tileValues.filter((i) => !i);
    console.log(doesLoose)
    if (!doesLoose.length) {
      setLoose(true);
      setKeyControl({
        ...keyControl,
        enabled: false,
        keydown: false,
      });
    }
  }

  const checkForWin = () => {
    let doesWin = tileValues.find((i) => i === 2048);
    if (doesWin) {
      setWin(true);
      setKeyControl({
        ...keyControl,
        enabled: false,
        keydown: false,
      });
    }
  }

  const randomValues = (tValues: any[], randomCount: number) => {
    const newTiles = [
      ...tValues
    ];
    for (let index = 0; index < randomCount; index++) {
      const randomIndex = Math.floor(Math.random() * tValues.length);
      if (newTiles[randomIndex] === 0) {
        newTiles[randomIndex] = 2;
        checkForGameOver()
      } else { randomValues(tValues, 1) }
    }
    return newTiles;
  }

  useEffect(() => {
    let newValues = randomValues(tileValues, 2);
    setTileValues(newValues);
  }, []);


  const moveDown = () => {
    const uRows: any[] = [];
    for (let i = 0; i < tileValues.length - 1; i++) {
      if (i % 4 === 0) {
        let totalOne = tileValues[i];
        let totalTwo = tileValues[i + 1];
        let totalThree = tileValues[i + 2];
        let totalFour = tileValues[i + 3];
        const row = [totalOne, totalTwo, totalThree, totalFour];
        const filterRow = row.filter(num => num).filter(Boolean);
        const zeros = Array(4 - row.filter(n => n).length).fill(0);
        const newRows = zeros.concat(filterRow)
        uRows.push([...newRows]);
      }
    }
    return uRows.flat()
  }
  const moveUp = () => {
    const uRows: any[] = [];
    for (let i = 0; i < tileValues.length - 1; i++) {
      if (i % 4 === 0) {
        let totalOne = tileValues[i];
        let totalTwo = tileValues[i + 1];
        let totalThree = tileValues[i + 2];
        let totalFour = tileValues[i + 3];
        const row = [totalOne, totalTwo, totalThree, totalFour];
        const filterRow = row.filter(num => num).filter(Boolean);
        const zeros = Array(4 - row.filter(n => n).length).fill(0);
        const newRows = filterRow.concat(zeros)
        uRows.push([...newRows]);
      }
    }
    return uRows.flat()
  }

  const moveHorizontal = (dir: 'left' | 'right') => {
    const uRows: any[] = tileValues;
    for (let i = 0; i < 4; i++) {
      let totalOne = tileValues[i];
      let totalTwo = tileValues[i + width * 1];
      let totalThree = tileValues[i + width * 2];
      let totalFour = tileValues[i + width * 3];
      const row = [totalOne, totalTwo, totalThree, totalFour];
      const filterRow = row.filter(num => num).filter(Boolean);
      const zeros = Array(4 - row.filter(n => n).length).fill(0);
      let newColumn = [];
      if (dir === 'right') {
        newColumn = zeros.concat(filterRow);
      } else {
        newColumn = filterRow.concat(zeros);
      }
      uRows[i] = newColumn[0]
      uRows[i + width * 1] = newColumn[1]
      uRows[i + width * 2] = newColumn[2]
      uRows[i + width * 3] = newColumn[3]
    }
    return uRows.flat()
  }

  const combineRow = (cValues: number[], dir: 'up' | 'down' | 'left' | 'right') => {
    for (let i = 0; i < cValues.length - 1; i++) {
      if (cValues[i] === cValues[i + 1]) {
        const sum = cValues[i] + cValues[i + 1];
        if (dir === 'down') {
          cValues[i + 1] = sum;
          cValues[i] = 0;
        } else {
          cValues[i + 1] = 0;
          cValues[i] = sum;
        }
        setScore(score => score + sum); // TODO: review score logic
      }
    }
    checkForWin();
    return cValues
  }
  const combineCol = (cValues: number[], dir: 'left' | 'right') => {
    for (let i = 0; i < 12; i++) {
      if (cValues[i] === cValues[i + width]) {
        const sum = cValues[i] + cValues[i + width];
        if (dir === 'right') {
          cValues[i + width] = sum;
          cValues[i] = 0;
        } else {
          console.log(i, i + width)
          cValues[i + width] = 0;
          cValues[i] = sum;
        }
        setScore(score => score + sum); // TODO: review score logic
      }
    }
    // checkWin();
    return cValues
  }

  const keyDown = () => {
    let downValues = moveDown()
    let cValues = combineRow(downValues, 'down')
    moveDown()
    let newValues = randomValues(cValues, 1)
    setTileValues(newValues)
  }

  const keyUp = () => {
    let downValues = moveUp()
    let cValues = combineRow(downValues, 'up')
    moveUp()
    let newValues = randomValues(cValues, 1)
    setTileValues(newValues)
  }
  const keyLeft = () => {
    let movedValues = moveHorizontal('left')
    let cValues = combineCol(movedValues, 'left')
    moveHorizontal('left')
    let newValues = randomValues(cValues, 1)
    setTileValues(newValues)
  }
  const keyRight = () => {
    let downValues = moveHorizontal('right')
    let cValues = combineCol(downValues, 'right')
    moveHorizontal('right')
    let newValues = randomValues(cValues, 1)
    setTileValues(newValues)
  }

  useHotkeys("ArrowLeft", () => keyLeft(), keyControl);
  useHotkeys("ArrowRight", () => keyRight(), keyControl);
  useHotkeys("ArrowUp", () => keyUp(), keyControl);
  useHotkeys("ArrowDown", () => keyDown(), keyControl);

  return (
    <>
      <div className="container w-[480px] flex flex-col mx-auto gap-10">
        <div className="flex justify-between">
          <div className="flex flex-col w-12/4 items-start">
            <h1 className="text-5xl font-bold underline">
              2048
            </h1>
            <p className="text-md font-bold">
              Join the number and get 2048 Tile!
            </p>
          </div>
          <div className=" flex flex-col bg-gray-500 text-white w-12/6 p-4 rounded-sm">
            <p className="text-md font-bold">
              Scores
            </p>
            <h1 className="text-2xl font-bold underline">
              {`${score}`}
            </h1>
          </div>
        </div>
        {win ? <div className="flex justify-center">
          <h2 className="text-3xl text-green-300">
            You Won!
          </h2>
        </div> : null}
        {loose ? <div className="flex justify-center">
          <h2 className="text-3xl text-red-700">
            You Loose!
          </h2>
        </div> : null}
        <div className="container">
          <div className="grid grid-rows-4 grid-flow-col gap-4 rounded-md p-4 bg-gray-200">
            {tileValues.map((value, index) => (<div
              className={`w-max-28 h-max-28 text-2xl flex justify-center items-center p-4 font-bold text-gray-800 rounded-md ${!value ? "bg-gray-400" : colorMap[`${value}`] || "bg-yellow-50"}`}
              key={`${value}-${index}`}>{`${value}`}</div>))}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
