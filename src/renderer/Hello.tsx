import icon from '../../assets/tasknote.png';

export default function Hello() {
  return (
    <div id="HelloInner">
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>Organize your project like this!</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            New Project Note
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            New Folder
          </button>
        </a>
      </div>
    </div>
  );
}
