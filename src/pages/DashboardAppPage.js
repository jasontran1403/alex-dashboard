import { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';

import { alpha, useTheme } from '@mui/material/styles';
// @mui
import { Grid, Container, Typography, MenuItem, Stack, IconButton, Popover, Input, Card, CardHeader, Box } from '@mui/material';
// components
import ReactApexChart from 'react-apexcharts';
import { fNumber, fShortenNumber } from '../utils/formatNumber';

import Iconify from '../components/iconify';
// components
import { useChart } from '../components/chart';

// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';


// ----------------------------------------------------------------------

const handleInitMonth = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const numberOfMonths = 3; // Số tháng bạn muốn tạo

  const recentMonths = [];

  let month = currentMonth;
  let year = currentYear;

  while (recentMonths.length < numberOfMonths) {
    // Định dạng tháng và năm thành chuỗi "MM/YYYY"
    const formattedMonth = `${String(month).padStart(2, '0')}/${year}`;
    recentMonths.push(formattedMonth);

    // Cập nhật tháng và năm cho tháng tiếp theo
    if (month === 1) {
      month = 12;
      year -= 1;
    } else {
      month -= 1;
    }
  }

  return recentMonths;
}


const convertToDate = (timeunix) => {
  // Tạo một đối tượng Date từ Unix timestamp
  const date = new Date(timeunix * 1000); // *1000 để chuyển đổi từ giây sang mili giây

  // Lấy ngày, tháng và năm từ đối tượng Date
  const day = date.getDate();
  const month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0, nên cần +1

  // Tạo chuỗi định dạng "dd/MM"
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
};
export default function DashboardAppPage() {
  const theme = useTheme();
  const [balance, setBalance] = useState(0.00);
  const [commission, setCommission] = useState(0.00);
  const [isLoading, setIsLoading] = useState(false);
  const [listMenu] = useState(handleInitMonth());
  const [currentMonth, setCurrentMonth] = useState(listMenu[0]);
  const [listExness, setListExness] = useState([]);
  const [currentExness, setCurrentExness] = useState("");
  const [label, setLabel] = useState([]);
  const [profits, setProfits] = useState();
  const [commissions, setCommissions] = useState([]);
  const [listTransaction, setListTransaction] = useState([]);
  const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
  const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
  const [refCode, setRefCode] = useState("");
  const [listTransaction2, setListTransaction2] = useState([]);
  const [prevData, setPrevData] = useState([]);

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const [open2, setOpen2] = useState(null);

  const handleOpen2 = (event) => {
    setOpen2(event.currentTarget);
  };

  const handleClose2 = () => {
    setOpen2(null);
  };

  const handleChangeMonth = (month) => {
    if (currentExness === "") {
      handleClose();
      return;
    }
    setCurrentMonth(month);
    fetchData(currentExness, month);
    handleClose();
  }

  const handleChangeExness = (exness) => {
    fetchData(exness, currentMonth);
    setCurrentExness(exness);
    handleClose2();
  }



  useEffect(() => {
    setIsLoading(true);

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://jellyfish-app-kafzn.ondigitalocean.app/api/v1/secured/get-exness/${encodeURI(currentEmail)}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios(config)
      .then((response) => {
        if (response.data.length > 0) {
          setListExness(response.data);
          setCurrentExness(response.data[0]);
          fetchData(response.data[0], listMenu[0]);
        }
      })
      .catch((error) => {
        console.log(error);
      });

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return (() => {
      clearTimeout(timeout);
    })
  }, []);

  useEffect(() => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://jellyfish-app-kafzn.ondigitalocean.app/api/v1/secured/get-transaction/email=${currentEmail}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios.request(config)
      .then((response) => {
        const firstFiveItems = response.data.slice(0, 5);
        setListTransaction(firstFiveItems);
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  useEffect(() => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://jellyfish-app-kafzn.ondigitalocean.app/api/v1/secured/get-prev-data/${currentEmail}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios.request(config)
      .then((response) => {
        setPrevData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  const fetchData = (exness, time) => {
    const [month, year] = time.split('/');

    // Tạo ngày đầu tiên của tháng và tháng sau
    const startDate = new Date(`${year}-${month}-01T00:00:00Z`);
    const nextMonth = parseInt(month, 10) + 1;
    const nextYear = nextMonth > 12 ? parseInt(year, 10) + 1 : year;

    const endDate = new Date(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00Z`);

    // Chuyển đổi thành timestamps Unix
    const startUnix = startDate.getTime() / 1000;
    const endUnix = endDate.getTime() / 1000;

    const encodedExness = encodeURIComponent(exness);
    const encodedFrom = encodeURIComponent(startUnix);
    const encodedTo = encodeURIComponent(endUnix);
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://jellyfish-app-kafzn.ondigitalocean.app/api/v1/secured/get-info-by-exness/exness=${encodedExness}&from=${encodedFrom}&to=${encodedTo}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };


    axios(config)
      .then((response) => {
        setBalance(response.data.profit);
        setCommission(response.data.commission);
        setLabel(response.data.profits.map((profit) => convertToDate(profit.time)));
        setProfits(response.data.profits.map((profit) => profit.amount > 0 ? fShortenNumber(profit.amount) : fNumber(profit.amount)));
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const chartData = [
    {
      name: 'Profit',
      type: 'line',
      fill: 'solid',
      data: profits,
    },
  ];

  const chartOptions = useChart({
    plotOptions: { bar: { columnWidth: '16%' } },
    fill: { type: chartData.map((i) => i.fill) },
    labels: label,
    xaxis: { type: 'text' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `$${y.toFixed(2)}`;
          }
          return y;
        },
      },
    },
    stroke: {
      width: 1, // Điều chỉnh độ lớn của line ở đây (số lớn hơn = line to hơn)
    },
  });

  return (
    <>
      <Helmet>
        <title> Something </title>
      </Helmet>

      <Container maxWidth="xl">
        {/* <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography> */}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary sx={{ mb: 2 }} title="Balance" total={balance} icon={'noto:money-with-wings'} />
            <AppWidgetSummary title="Total Commissions" total={commission} color="info" icon={'flat-color-icons:bullish'} />
          </Grid>

          {/* <Grid item xs={12} sm={6} md={4}>
            
          </Grid> */}

          <Grid item xs={12} sm={6} md={6}>
            <AppCurrentVisits
              title="Assets last month"
              change={balance - prevData?.balance}
              chartData={[
                { label: 'Profit', value: prevData.commission ? prevData.commission : 0.5 },
                { label: 'Withdraw/Deposit', value: prevData.transaction ? prevData.transaction : 0.5 },
              ]}
              chartColors={[
                theme.palette.success.main,
                theme.palette.primary.main,
              ]}
            />
          </Grid>

          {/* // { label: 'IB', value: 3 } // theme.palette.warning.main
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Item Orders" total={1723315} color="warning" icon={'ant-design:windows-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Bug Reports" total={234} color="error" icon={'ant-design:bug-filled'} />
          </Grid> */}

          <Grid item xs={12} sm={12} md={12}>
            <IconButton
              onClick={handleOpen}
              sx={{
                padding: 0,
                width: 44,
                height: 44,
                ...(open && {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity),
                }),
              }}
            >
              <Input type="text" value={`Tháng  ${currentMonth}`} style={{ minWidth: "150px", marginLeft: "120px", paddingLeft: "20px" }} />
            </IconButton>
            <Popover
              open={Boolean(open)}
              anchorEl={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{
                sx: {
                  p: 1,
                  width: 140,
                  '& .MuiMenuItem-root': {
                    px: 1,
                    typography: 'body2',
                    borderRadius: 0.75,
                  },
                },
              }}
            >
              {listMenu.map((item, index) => {
                return <MenuItem key={index} onClick={() => { handleChangeMonth(item) }}>
                  <Iconify sx={{ mr: 2 }} />
                  {item}
                </MenuItem>
              })}


            </Popover>
          </Grid>

          <Grid item xs={12} sm={12} md={12}>
            <IconButton
              onClick={handleOpen2}
              sx={{
                padding: 0,
                width: 44,
                height: 44,
                ...(open2 && {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity),
                }),
              }}
            >
              <Input type="text" value={`Exness ID  ${currentExness}`} style={{ minWidth: "200px", marginLeft: "120px", paddingLeft: "20px" }} />
            </IconButton>
            <Popover
              open={Boolean(open2)}
              anchorEl={open2}
              onClose={handleClose2}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{
                sx: {
                  p: 1,
                  width: 140,
                  '& .MuiMenuItem-root': {
                    px: 1,
                    typography: 'body2',
                    borderRadius: 0.75,
                  },
                },
              }}
            >
              {listExness.map((item, index) => {
                return <MenuItem key={index} onClick={() => { handleChangeExness(item) }}>
                  <Iconify sx={{ mr: 2 }} />
                  {item}
                </MenuItem>
              })}
            </Popover>
          </Grid>

          <Grid item xs={12} md={12} lg={12}>

            {/* <AppWebsiteVisits
              title="Profit history"
              subheader=""
              chartLabels={label}
              chartData={[
                {
                  name: 'Profit',
                  type: 'line',
                  fill: 'solid',
                  data: [1, 2, 3, 4, 5],
                },
              ]}
            /> */}

            <Card>
              <CardHeader title={"Profit history"} subheader={""} />

              <Box sx={{ p: 3, pb: 1 }} dir="ltr">
                <ReactApexChart type="line" series={chartData} options={chartOptions} height={364} />
              </Box>
            </Card>
          </Grid>



          {/* <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Conversion Rates"
              subheader="(+43%) than last year"
              chartData={[
                { label: 'Italy', value: 400 },
                { label: 'Japan', value: 430 },
                { label: 'China', value: 448 },
                { label: 'Canada', value: 470 },
                { label: 'France', value: 540 },
                { label: 'Germany', value: 580 },
                { label: 'South Korea', value: 690 },
                { label: 'Netherlands', value: 1100 },
                { label: 'United States', value: 1200 },
                { label: 'United Kingdom', value: 1380 },
              ]}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Subject"
              chartLabels={['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math']}
              chartData={[
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid> */}

          <Grid item xs={12} md={12} lg={12}>
            <AppNewsUpdate
              title="Transactions"
              list={listTransaction}
            />
          </Grid>

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline
              title="Order Timeline"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: [
                  '1983, orders, $4220',
                  '12 Invoices have been paid',
                  'Order #37745 from September',
                  'New order placed #XF-2356',
                  'New order placed #XF-2346',
                ][index],
                type: `order${index + 1}`,
                time: faker.date.past(),
              }))}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppTrafficBySite
              title="Traffic by Site"
              list={[
                {
                  name: 'FaceBook',
                  value: 323234,
                  icon: <Iconify icon={'eva:facebook-fill'} color="#1877F2" width={32} />,
                },
                {
                  name: 'Google',
                  value: 341212,
                  icon: <Iconify icon={'eva:google-fill'} color="#DF3E30" width={32} />,
                },
                {
                  name: 'Linkedin',
                  value: 411213,
                  icon: <Iconify icon={'eva:linkedin-fill'} color="#006097" width={32} />,
                },
                {
                  name: 'Twitter',
                  value: 443232,
                  icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} />,
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppTasks
              title="Tasks"
              list={[
                { id: '1', label: 'Create FireStone Logo' },
                { id: '2', label: 'Add SCSS and JS files if required' },
                { id: '3', label: 'Stakeholder Meeting' },
                { id: '4', label: 'Scoping & Estimations' },
                { id: '5', label: 'Sprint Showcase' },
              ]}
            />
          </Grid> */}
        </Grid>
      </Container>
    </>
  );
}
