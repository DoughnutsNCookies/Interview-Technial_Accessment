import { useContext, useEffect, useState } from "react";
import SettingContext from "../contexts/SettingContext";
import { UserDTO, ResultContext } from "../contexts/ResultContext";

function Home() {
  const [type, setType] = useState<string>("ALL");
  const [order, setOrder] = useState<string>("DESC");
  const [find, setFind] = useState<string>("WORD");
  const [k, setK] = useState<number>(0);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<UserDTO[] | UserDTO[][]>([]);
  const [toolTip, setToolTip] = useState<string>("ALL");

  return (
    <SettingContext.Provider
      value={{ type, order, find, k, droppedFiles, setDroppedFiles }}
    >
      <ResultContext.Provider value={{ results, setResults }}>
        <main className=" font-jbmono p-20">
          <div className=" flex flex-row text-highlight justify-between gap-x-32">
            <div className=" w-1/2">
              <h1 className="text-4xl pb-5">Upload a log file (.txt)</h1>
              <FileDropZone />
            </div>
            <div className=" w-1/2 pt-14 flex flex-col">
              <h1 className="text-2xl pb-2">Results:</h1>
              <AnswerBox />
              <div className=" flex flex-row justify-evenly pt-3">
                <SettingButton
                  opt1="ALL"
                  opt2="PER"
                  setter={setType}
                  setting={type}
                  setTooltip={setToolTip}
                />
                <SettingButton
                  opt1="DESC"
                  opt2="ASC"
                  setter={setOrder}
                  setting={order}
                  setTooltip={setToolTip}
                />
                <SettingButton
                  opt1="WORD"
                  opt2="SENT"
                  setter={setFind}
                  setting={find}
                  setTooltip={setToolTip}
                />
                <KInput setter={setK} />
              </div>
              <span className="text-center w-full py-1 text-md text-highlight animate-pulse">
                {(toolTip === "ALL" && "Showing results from ALL files") ||
                  (toolTip === "PER" && "Showing results PER file") ||
                  (toolTip === "DESC" && "Showing results in DESC order") ||
                  (toolTip === "ASC" && "Showing results in ASC order") ||
                  (toolTip === "WORD" &&
                    "Showing results of WORD count per user") ||
                  (toolTip === "SENT" &&
                    "Showing results of SENTENCE count per user")}
              </span>
            </div>
          </div>
        </main>
      </ResultContext.Provider>
    </SettingContext.Provider>
  );
}

export default Home;

const FileDropZone = () => {
  const [highlighted, setHighlighted] = useState<boolean>(false);
  const { type, order, find, k, droppedFiles, setDroppedFiles } =
    useContext(SettingContext);
  const { setResults } = useContext(ResultContext);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHighlighted(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHighlighted(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHighlighted(false);

    const files = Array.from(e.dataTransfer.files) as File[];
    const uniqueFiles = files.filter(
      (file) =>
        !droppedFiles.some((droppedFile) => droppedFile.name === file.name)
    );
    setDroppedFiles((prevFiles: File[]) => [...prevFiles, ...uniqueFiles]);
  };

  const handleRemoveFile = (file: File[]) => {
    setDroppedFiles((prevFiles: File[]) =>
      prevFiles.filter((prevFile) => !file.includes(prevFile))
    );
  };

  const handleRemoveAll = () => {
    setDroppedFiles([]);
    setResults([]);
  };

  return (
    <div
      className={`${
        highlighted && droppedFiles.length === 0
          ? "bg-highlight text-dimshadow border-dimshadow"
          : "border-highlight"
      }
      ${
        droppedFiles.length === 0 && "justify-center flex flex-col h-[500px]"
      } relative w-full border-2 border-dashed py-4 text-center cursor-pointer rounded-md transition-all`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <p className="pb-2">
        {droppedFiles.length === 0
          ? "Drag and drop your files here"
          : "You can still drop more!"}
      </p>
      {droppedFiles.length === 0 ? (
        <p>
          or click <input type="file" id="fileInput" className="hidden" />
          <label
            htmlFor="fileInput"
            className="cursor-pointer text-accCyan hover:underline"
          >
            HERE
          </label>
        </p>
      ) : (
        <></>
      )}
      {droppedFiles.length > 0 && (
        <>
          <hr className="mx-4" />
          <ul className="my-4 h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-highlight scrollbar-track-highlight/10">
            {droppedFiles.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between py-1 rounded-md transition-all hover:bg-highlight/10"
              >
                <span
                  className={`${
                    file.name.endsWith(".txt") && file.size < 1000000
                      ? "text-highlight"
                      : " text-accRed"
                  } pl-4`}
                >
                  {file.name.length <= 16
                    ? file.name
                    : file.name.substring(0, 16) + "..."}
                </span>
                <button
                  className="text-accRed hover:text-white transition-all hover:bg-accRed px-2 mr-2 rounded-md ease-linear"
                  onClick={() => handleRemoveFile([file])}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <hr className="pb-4 mx-4" />
          <div className="flex flex-row justify-evenly">
            <button
              className=" text-accGreen w-1/3 font-bold border-2 border-accGreen px-2 py-1 rounded-md hover:bg-accGreen hover:text-white transition-all"
              onClick={async () =>
                uploadFiles(type, order, find, k, droppedFiles, setResults)
              }
            >
              Upload
            </button>
            <button
              className="text-accRed w-1/3 border-2 border-accRed px-2 py-1 rounded-md hover:bg-accRed hover:text-white transition-all"
              onClick={() => handleRemoveAll()}
            >
              Remove All
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const AnswerBox = () => {
  const { find, droppedFiles } = useContext(SettingContext);
  const { results } = useContext(ResultContext);

  const ListItems = (props: { output: UserDTO[] | UserDTO[][] }) => (
    <ul>
      {props.output.map((result: any, userIndex: number) => (
        <li
          key={result.name}
          className="pb-1 flex flex-row justify-between rounded-md transition-all hover:bg-highlight/10"
        >
          <div className="flex flex-row">
            <span className="pl-4 font-bold w-14">{userIndex + 1}.</span>
            <span>
              {result.name.length <= 16
                ? result.name
                : result.name.substring(0, 16) + "..."}
            </span>
          </div>
          <span className="pr-4">
            {result.count} {find === "WORD" ? "words" : "sentences"}
          </span>
        </li>
      ))}
    </ul>
  );

  const NestedListItems = () => (
    <>
      {results.map((file: any, fileIndex) => (
        <div key={fileIndex} className="pb-2">
          <span className="text-lg ml-4">
            {droppedFiles[fileIndex].name.length <= 32
              ? droppedFiles[fileIndex].name
              : droppedFiles[fileIndex].name.substring(0, 32) + "..."}
          </span>
          <hr className="mx-4 py-1" />
          <ListItems output={file} />
        </div>
      ))}
    </>
  );

  return (
    <div className="bg-dimshadow border-highlight">
      <div className="border-2 py-2 h-[400px] overflow-y-auto rounded-md scrollbar-thin scrollbar-thumb-highlight scrollbar-track-highlight/10 transition-all">
        {Array.isArray(results[0]) && results[0].length > 0 ? (
          <NestedListItems />
        ) : (
          <ListItems output={results} />
        )}
      </div>
    </div>
  );
};

const uploadFiles = async (
  type: string,
  order: string,
  find: string,
  k: number,
  droppedFiles: File[],
  setResults: (results: any) => void
) => {
  const formData = new FormData();

  droppedFiles.forEach((file) => {
    formData.append("file", file);
  });
  formData.append("order", order);
  formData.append("find", find);
  formData.append("k", k.toString());
  try {
    const response = await fetch(
      "http://localhost:3000/" + type.toLowerCase(),
      {
        method: "POST",
        body: formData,
      }
    );
    if (response.status !== 201) {
      const errorResponse = await response.json();
      console.log(errorResponse.message);
    } else {
      const data = await response.json();
      setResults(data);
    }
  } catch (error) {
    console.log(error);
  }
};

interface ISettingButton {
  opt1: string;
  opt2: string;
  setter: (opt: string) => void;
  setting: string;
  setTooltip: (toolTip: string) => void;
}

const SettingButton = (props: ISettingButton) => {
  const { opt1, opt2, setter, setting, setTooltip } = props;
  const { type, order, find, k, droppedFiles } = useContext(SettingContext);
  const { setResults } = useContext(ResultContext);

  useEffect(() => {
    uploadFiles(type, order, find, k, droppedFiles, setResults);
    setTooltip(setting);
  }, [setting]);

  return (
    <button
      className={`border-2 ${
        setting === opt1
          ? "border-accCyan text-accCyan"
          : "border-accYellow text-accYellow"
      } rounded-md w-1/5 transition-all`}
      onClick={() => setter(setting === opt1 ? opt2 : opt1)}
      onMouseOver={() => setTooltip(setting)}
      onMouseLeave={() => setTooltip("")}
    >
      {setting}
    </button>
  );
};

interface IKInput {
  setter: (k: number) => void;
}

const KInput = (props: IKInput) => {
  const { setter } = props;
  const { type, order, find, k, droppedFiles } = useContext(SettingContext);
  const { setResults } = useContext(ResultContext);

  useEffect(() => {
    if (Number.isNaN(k)) return;
    uploadFiles(type, order, find, k, droppedFiles, setResults);
  }, [k]);

  return (
    <input
      type="number"
      placeholder="K Value"
      className=" w-1/5 bg-transparent rounded-md border-2 border-highlight text-center number-input focus:outline-none"
      onChange={(e) => setter(parseInt(e.target.value))}
    />
  );
};
