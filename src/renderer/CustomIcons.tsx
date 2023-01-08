import { VscNewFolder, VscNewFile } from 'react-icons/vsc';
import Icon, { IconProps } from '@atlaskit/icon';

const NewFileIcon = (props: IconProps | never) => {
  const { secondaryColor, size, label } = props;
  return (
    <Icon
      glyph={VscNewFile}
      label={label}
      size={size}
      secondaryColor={secondaryColor}
    />
  );
};

const NewFolderIcon = (props: IconProps | never) => {
  const { secondaryColor, size, label } = props;
  return (
    <Icon
      glyph={VscNewFolder}
      label={label}
      size={size}
      secondaryColor={secondaryColor}
    />
  );
};

export { NewFileIcon, NewFolderIcon };
