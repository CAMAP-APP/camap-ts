import { Icon, IconProps } from '@mui/material';

/**
 * List of availables icons from
 * https://github.com/bablukid/camap-icon-font
 */
export enum CamapIconId {
  alert = 'alert',
  apple = 'apple',
  bankCard = 'bank-card',
  bankTransfer = 'bank-transfer',
  basketAdd = 'basket-add',
  basket = 'basket',
  bio = 'bio',
  book = 'book',
  bulk = 'bulk',
  calendarCheck = 'calendar-check',
  calendar = 'calendar',
  card = 'card',
  check = 'check',
  cheque = 'cheque',
  chevronDown = 'chevron-down',
  chevronLeft = 'chevron-left',
  chevronRight = 'chevron-right',
  chevronUp = 'chevron-up',
  chicken = 'chicken',
  clock = 'clock',
  cog = 'cog',
  delete = 'delete',
  download = 'download',
  edit = 'edit',
  euro = 'euro',
  eye = 'eye',
  facebook = 'facebook',
  farmerPro = 'farmer-pro',
  farmer = 'farmer',
  file = 'file',
  fork = 'fork',
  github = 'github',
  home = 'home',
  info = 'info',
  image = 'image',
  link = 'link',
  list = 'list',
  mail = 'mail',
  mapMarker = 'map-marker',
  moneypot = 'moneypot',
  paymentType = 'payment-type',
  phone = 'phone',
  plus = 'plus',
  print = 'print',
  products = 'products',
  scale = 'scale',
  search = 'search',
  signOut = 'sign-out',
  star = 'star',
  tag = 'tag',
  tote = 'tote',
  truckShipping = 'truck-shipping',
  truck = 'truck',
  twitter = 'twitter',
  upload = 'upload',
  user = 'user',
  users = 'users',
  vacation = 'vacation',
  wholesale = 'wholesale',
  world = 'world',
  youtube = 'youtube',
}

export interface CamapIconProps {
  id: CamapIconId;
  className?: string;
}

/**
    A mui Icon using Camap's icon font
* */
const CamapIcon = ({
  id,
  className,
  ...iconProps
}: CamapIconProps & IconProps) => {
  let classes = `icons icon-${id}`;
  if (className) classes += ` ${className}`;

  return (
    <Icon
      component="i"
      fontSize={iconProps.fontSize || 'inherit'}
      className={classes}
      {...iconProps}
    />
  );
};

export default CamapIcon;
