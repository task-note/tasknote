import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import FolderIcon from '@material-ui/icons/Folder';
import DescriptionIcon from '@material-ui/icons/Description';
import Button, { ButtonGroup } from '@atlaskit/button';
import { NewFileIcon, NewFolderIcon } from './CustomIcons';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from '../../packages/react-vertical-timeline/src/index';
import '../../packages/react-vertical-timeline/src/VerticalTimeline.css';
import '../../packages/react-vertical-timeline/src/VerticalTimelineElement.css';
import './Timeline.css';
import { log } from './Logger';

interface TimelineHeaderProp {
  title: string;
}

export interface TimelineData {
  title: string;
  subtitle: string;
  createTime: Date;
  modifyTime: Date;
  content: string;
  key: string;
  isFile: boolean;
}

function capString(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTimelineContent(elements: TimelineData[]) {
  const propsFile = {
    date: '2023',
    className: 'vertical-timeline-element--work',
    contentArrowStyle: { borderRight: '7px solid  rgb(33, 150, 243)' },
    iconStyle: { background: 'rgb(33, 150, 243)', color: '#fff' },
    icon: <DescriptionIcon />,
  };

  const propsFolder = {
    date: '2023',
    className: 'vertical-timeline-element--education',
    contentArrowStyle: { borderRight: '7px solid  rgb(233, 30, 99)' },
    iconStyle: { background: 'rgb(233, 30, 99)', color: '#fff' },
    icon: <FolderIcon />,
  };

  const getProps = (element: TimelineData) => {
    const props = element.isFile ? propsFile : propsFolder;
    props.date = element.modifyTime.toLocaleString();
    return props;
  };

  return elements.map((element) => {
    const props = getProps(element);
    return (
      <VerticalTimelineElement {...props} key={element.key}>
        <h3 className="vertical-timeline-element-title">{element.title}</h3>
        <h4 className="vertical-timeline-element-subtitle">
          {element.subtitle}
        </h4>
        <p>{element.content}</p>
      </VerticalTimelineElement>
    );
  });
}

function TimelineHeader({ title }: TimelineHeaderProp) {
  return (
    <div id="timeline_toolbar">
      <h1 id="timeline_title">{title}</h1>
      <div id="timeline_buttons">
        <ButtonGroup appearance="primary">
          <Button iconBefore={<NewFolderIcon label="" size="small" />}>
            New Folder
          </Button>
          <Button iconBefore={<NewFileIcon label="" size="small" />}>
            New Project Note
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

export default function Timeline() {
  const { state } = useLocation();
  const { id, title } = state; // Read values passed on state
  const [currentLocation, setCurrentLocation] = useState('');

  const location = useLocation();
  if (location.key !== currentLocation) {
    setCurrentLocation(location.key);
    log('-->', 'loadData for ', id);
  }

  const elements = [
    {
      title: 'Creative Director',
      subtitle: 'Miami, FL',
      isFile: true,
      modifyTime: new Date(),
      createTime: new Date(),
      key: '1',
      content: 'Creative Direction, User Experience, Visual Design, Project Management, Team Leading'
    },
    {
      title: 'Creative Director',
      subtitle: 'Miami, FL',
      isFile: false,
      modifyTime: new Date(),
      createTime: new Date(),
      key: '2',
      content: 'Creative Direction, User Experience,n Visual Design, Project Management, Team Leading '
    },
  ];

  const timelineEle = getTimelineContent(elements);
  return (
    <div id="timeline_root">
      <TimelineHeader title={capString(title)} />
      <VerticalTimeline>{timelineEle}</VerticalTimeline>
    </div>
  );
}
