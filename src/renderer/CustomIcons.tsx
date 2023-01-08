import { VscNewFolder, VscNewFile } from 'react-icons/vsc';
import Icon, { IconProps } from '@atlaskit/icon';

const NewFileIcon = (props: IconProps | never) => {
  const { secondaryColor, size, label } = props;
  const CustomGlyph = () => <VscNewFile strokeWidth="0.5" />;
  return (
    <Icon
      glyph={CustomGlyph}
      label={label}
      size={size}
      secondaryColor={secondaryColor}
    />
  );
};

const NewFolderIcon = (props: IconProps | never) => {
  const { secondaryColor, size, label } = props;
  const CustomGlyph = () => <VscNewFolder strokeWidth="0.5" />;
  return (
    <Icon
      glyph={CustomGlyph}
      label={label}
      size={size}
      secondaryColor={secondaryColor}
    />
  );
};

export { NewFileIcon, NewFolderIcon };
