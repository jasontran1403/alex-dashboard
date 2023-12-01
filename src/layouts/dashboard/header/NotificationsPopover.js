import PropTypes from 'prop-types';
import { set, sub } from 'date-fns';
import { noCase } from 'change-case';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// @mui
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Popover,
  Typography,
  IconButton,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';
// utils
import { prod, dev } from "../../../utils/env";
import { fToNow } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';

// ----------------------------------------------------------------------
export default function NotificationsPopover() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
  const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
  const [totalUnRead, setTotalUnRead] = useState(0);

  useEffect(() => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/get-message/email=${currentEmail}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios.request(config)
      .then((response) => {
        setTotalUnRead(response.data.length);
        setAllNotifications(response.data);
        const firstThreeItems = response.data.slice(0, 3);

        setNotifications(firstThreeItems);
      })
      .catch((error) => {
        if (error.response.status === 403) {
          Swal.fire({
            title: "An error occured",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            title: "Session is ended, please login again !",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
          });
        }
      });

  }, []);

  const handleToggle = (id) => {
    if (typeof (id) === "number") {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${prod}/api/v1/secured/toggle-message/id=${id}`,
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`
        }
      };

      axios.request(config)
        .then((response) => {
          if (response.data === "OK") {
            setTotalUnRead(totalUnRead - 1);

            // Cập nhật mảng notifications bằng cách loại bỏ thông báo đã đọc
            const updatedNotifications = allNotifications.filter(
              (notification) => notification.id !== id
            );

            // Cập nhật state notifications với mảng notifications mới
            setNotifications(updatedNotifications);

            // Cập nhật state allNotifications với mảng allNotifications đã cập nhật
            setAllNotifications(updatedNotifications);

          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            Swal.fire({
              title: "An error occured",
              icon: "error",
              timer: 3000,
              position: 'center',
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              title: "Session is ended, please login again !",
              icon: "error",
              timer: 3000,
              position: 'center',
              showConfirmButton: false
            }).then(() => {
              // localStorage.clear();
              // navigate('/login', { replace: true });
            });
          }
        });
    }
  }

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isUnRead: false,
      }))
    );
  };

  return (
    <>
      <IconButton color={open ? 'primary' : 'default'} onClick={handleOpen} sx={{ width: 40, height: 40 }}>
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="eva:bell-fill" />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            ml: 0.75,
            width: 360,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                New
              </ListSubheader>
            }
          >
            {notifications.slice(0, 3).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} handleToggle={handleToggle} />
            ))}
          </List>

          {/* <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Before that
              </ListSubheader>
            }
          >
            {notifications.slice(2, 5).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List> */}
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple>
            View All
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.number,
    id: PropTypes.number,
    isRead: PropTypes.bool,
    message: PropTypes.string,
  }),
};

function NotificationItem({ notification, handleToggle }) {
  const { message } = renderContent(notification);
  handleToggle();

  const handleConvertTime = (unixTimestamp) => {
    // return format(new Date(timeunix * 1000), 'HH:mm:ss dd/MM/yyyy');
    const date = new Date(unixTimestamp * 1000); // Nhân với 1000 để chuyển đổi sang mili giây

    const options = {
      weekday: 'short', // Ngày trong tuần (viết tắt)
      month: 'short',   // Tháng (viết tắt)
      day: '2-digit',    // Ngày trong tháng (số)
      year: 'numeric',   // Năm (số)
      hour: 'numeric',   // Giờ (số)
      minute: 'numeric', // Phút (số)
      second: 'numeric', // Giây (số)
      timeZoneName: 'short' // Tên múi giờ (viết tắt)
    };

    return date.toLocaleString('en-US', options);
  }
  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isRead && {
          bgcolor: 'action.selected',
        }),
      }}
      onClick={() => { handleToggle(notification.id) }}
    >
      {/* <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
      </ListItemAvatar> */}
      <ListItemText
        primary={message}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
            {fToNow(handleConvertTime(notification.time))}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const message = (
    <Typography variant="subtitle2">
      {notification.message}
    </Typography>
  );

  return {
    message,
  };

  // if (notification.type === 'order_placed') {
  //   return {
  //     avatar: <img alt={notification.title} src="/assets/icons/ic_notification_package.svg" />,
  //     title,
  //   };
  // }
  // if (notification.type === 'order_shipped') {
  //   return {
  //     avatar: <img alt={notification.title} src="/assets/icons/ic_notification_shipping.svg" />,
  //     title,
  //   };
  // }
  // if (notification.type === 'mail') {
  //   return {
  //     avatar: <img alt={notification.title} src="/assets/icons/ic_notification_mail.svg" />,
  //     title,
  //   };
  // }
  // if (notification.type === 'chat_message') {
  //   return {
  //     avatar: <img alt={notification.title} src="/assets/icons/ic_notification_chat.svg" />,
  //     title,
  //   };
  // }
}
