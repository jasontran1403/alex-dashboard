import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
import Swal from 'sweetalert2';
import { alpha, useTheme } from '@mui/material/styles';
// @mui
import { Grid, Container, Typography, MenuItem, Stack, IconButton, Popover, Input, Card, CardHeader, Box } from '@mui/material';
// components
import ReactApexChart from 'react-apexcharts';
import { fCurrency, fNumber, fShortenNumber } from '../utils/formatNumber';
import Iconify from '../components/iconify';
// components
import { useChart } from '../components/chart';
import { prod, dev } from "../utils/env";

// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppWidgetSummaryUSD,
  AppWidgetSummaryCommissions,
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
  const navigate = useNavigate();
  const theme = useTheme();
  const [balances, setBalances] = useState([]);
  const [balance, setBalance] = useState(0.00);
  const [commission, setCommission] = useState(0.00);
  const [isLoading, setIsLoading] = useState(false);
  const [listMenu] = useState(handleInitMonth());
  const [currentMonth, setCurrentMonth] = useState(listMenu[0]);
  const [listExness, setListExness] = useState([]);
  const [currentExness, setCurrentExness] = useState("");
  const [label, setLabel] = useState([]);
  const [commissionLabel, setCommissionLabel] = useState([]);
  const [profits, setProfits] = useState();
  const [commissions, setCommissions] = useState([]);
  const [listTransaction, setListTransaction] = useState([]);
  const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
  const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
  const [refCode, setRefCode] = useState("");
  const [listTransaction2, setListTransaction2] = useState([]);
  const [prevBalance, setPrevBalance] = useState([]);
  const [prevProfit, setPrevProfit] = useState(0.0);
  const [prevDeposit, setPrevDeposit] = useState(0.0);
  const [prevWithdraw, setPrevWithdraw] = useState(0.0);
  const [isAdmin] = useState(currentEmail === "trantuongthuy@gmail.com");
  const [totalCommissions, setTotalCommissions] = useState(0.0);

  useEffect(() => {
    if (currentEmail === "trantuongthuy@gmail.com") {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${prod}/api/v1/secured/get-total-commission/${currentEmail}`,
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`
        }
      };

      axios.request(config)
        .then((response) => {
          console.log(response.data);
          setTotalCommissions(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

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
    if (currentExness === "All") {
      setCurrentMonth(month);
      fetchData(currentEmail, month);
    } else {
      setCurrentMonth(month);
      fetchData(currentExness, month);
    }


    handleClose();
  }

  const handleChangeExness = (exness) => {
    if (exness === "All") {
      setCurrentExness(exness);
      fetchData(currentEmail, currentMonth);
      fetchPrev(currentEmail);
    } else {
      setCurrentExness(exness);
      fetchData(exness, currentMonth);
      fetchPrev(exness);
    }

    handleClose2();
  }

  useEffect(() => {
    setIsLoading(true);

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/get-exness/${encodeURI(currentEmail)}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios(config)
      .then((response) => {
        if (response.data.length > 0) {
          const updatedList = ["All"].concat(response.data);
          setListExness(updatedList);

          setCurrentExness("All");
          fetchData(currentEmail, listMenu[0]);
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
            localStorage.clear();
            navigate('/login', { replace: true });
          });
        }
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
      url: `${prod}/api/v1/secured/get-transaction/email=${currentEmail}`,
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

  useEffect(() => {
    fetchPrev(currentEmail);
  }, []);

  const fetchPrev = (exness) => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/get-prev-data/${exness}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios.request(config)
      .then((response) => {
        setPrevBalance(response.data.balance);
        setPrevProfit(response.data.profit);
        setPrevDeposit(response.data.deposit);
        setPrevWithdraw(response.data.withdraw);
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

  }

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

    const encodedFrom = encodeURIComponent(startUnix);
    const encodedTo = encodeURIComponent(endUnix);
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/get-info-by-exness/exness=${exness}&from=${encodedFrom}&to=${encodedTo}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };


    axios(config)
      .then((response) => {
        setBalance(response.data.profit);
        setCommission(response.data.commission);

        const dataProfits = response.data.profits.map((profit) => profit);

        // Tạo một đối tượng để lưu trữ tổng số lượng dựa trên thời gian
        const timeMap = {};

        // Lặp qua mảng dữ liệu và tính tổng số lượng dựa trên thời gian
        dataProfits.forEach(item => {
          const { time, amount } = item;
          if (timeMap[time] === undefined) {
            timeMap[time] = 0;
          }
          timeMap[time] += amount;
        });


        // Chuyển đổi đối tượng thành một mảng kết quả
        const result = Object.keys(timeMap).map(time => ({
          time: parseInt(time, 10),
          amount: timeMap[time]
        }));

        setLabel(result.map((profit) => convertToDate(profit.time)));
        setProfits(result.map((profit) => profit.amount));

        const dataBalances = response.data.balances.map((balance) => balance);

        // Tạo một đối tượng để lưu trữ tổng số lượng dựa trên thời gian
        const timeMapBalances = {};

        // Lặp qua mảng dữ liệu và tính tổng số lượng dựa trên thời gian
        dataBalances.forEach(item => {
          const { time, amount } = item;
          if (timeMapBalances[time] === undefined) {
            timeMapBalances[time] = 0;
          }
          timeMapBalances[time] += amount;
        });


        // Chuyển đổi đối tượng thành một mảng kết quả
        const resultBalances = Object.keys(timeMapBalances).map(time => ({
          time: parseInt(time, 10),
          amount: timeMapBalances[time]
        }));
        setBalances(resultBalances.map((profit) => profit.amount));

        // 
        const dataCommissions = response.data.commissions.map((commission) => commission);

        // Tạo một đối tượng để lưu trữ tổng số lượng dựa trên thời gian
        const timeMapCommissions = {};

        // Lặp qua mảng dữ liệu và tính tổng số lượng dựa trên thời gian
        dataCommissions.forEach(item => {
          const { time, amount } = item;
          if (timeMapCommissions[time] === undefined) {
            timeMapCommissions[time] = 0;
          }
          timeMapCommissions[time] += amount;
        });


        // Chuyển đổi đối tượng thành một mảng kết quả
        const resultCommissions = Object.keys(timeMapCommissions).map(time => ({
          time: parseInt(time, 10),
          amount: timeMapCommissions[time]
        }));

        setCommissionLabel(resultCommissions.map((commission) => convertToDate(commission.time)));
        setCommissions(resultCommissions.map((commission) => commission.amount));
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
  }

  const chartData = [
    {
      name: 'Profit',
      type: 'line',
      data: profits,
      yAxis: 0,
    },
    {
      name: 'Balance',
      type: 'line',
      data: balances,
      yAxis: 1,
    },
  ];

  const chartData2 = [
    {
      name: 'Commission',
      type: 'line',
      data: commissions,
      yAxis: 0,
    },
  ];

  const chartOptions = useChart({
    plotOptions: { bar: { columnWidth: '16%' } },
    fill: {
      type: 'solid',
    },
    colors: ["#27cf5c", "#1d7fc4"],
    labels: label,
    xaxis: { type: 'text' },
    yaxis: [
      // Cấu hình cho trục y-axis bên trái
      {
        title: {
          text: 'Profits',
        },
        labels: {
          "formatter": function (value) {
            return fShortenNumber(value); // Định dạng số nguyên
          },
        },
      },
      // Cấu hình cho trục y-axis bên phải
      {
        opposite: true, // Điều này đảm bảo rằng trục y-axis nằm ở phía bên phải
        title: {
          text: 'Balances',
        },
        tickAmount: 5,
        max: balance === 0 ? 50000 : balance > 500000 ? balance * 2 : balance * 3,
        labels: {
          "formatter": function (value) {
            if (typeof value === "undefined" || value === 5e-324) {
              return 0; // Hoặc giá trị mặc định khác tùy ý
            }
            return fShortenNumber(value);
          },
        },
      },
    ],

    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return y === 0 ? '0 USC' : `${fShortenNumber(y)} USC`;
          }
          return y;
        },
      },
    },
    stroke: {
      width: 1, // Điều chỉnh độ lớn của line ở đây (số lớn hơn = line to hơn)
    },
  });

  const chartOptions2 = useChart({
    plotOptions: { bar: { columnWidth: '16%' } },
    fill: {
      type: 'solid',
    },
    colors: ["#ff3273"],
    labels: commissionLabel,
    xaxis: { type: 'text' },
    yaxis: [
      // Cấu hình cho trục y-axis bên trái
      {
        title: {
          text: 'Commissions',
        },
        labels: {
          "formatter": function (value) {
            return fShortenNumber(value); // Định dạng số nguyên
          },
        },
      },
      // Cấu hình cho trục y-axis bên phải
    ],

    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return y === 0 ? '0 USD' : `${fShortenNumber(y)} USD`;
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
        <title> Dashboard </title>
        <link rel='icon' type='image/x-icon' href='/assets/logo.svg' />
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Dashboard
        </Typography>
        <Grid item xs={12} sm={12} md={12} >

          <Input className="form-field " onClick={handleOpen2} type="text" value={'Search' || currentExness === "All" ? currentExness : `Exness ID ${currentExness}`} style={{ minWidth: "200px", marginBottom: "15px", paddingLeft: "10px", cursor: "pointer!important", }} />
          <Popover

            open={Boolean(open2)}
            anchorEl={open2}
            onClose={handleClose2}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{

              sx: {
                p: 1,
                width: 240,
                marginTop: "40px",
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

        <Grid container spacing={3}>
          {isAdmin ? (
            <>
              <Grid item xs={12} sm={3} md={3}>
                <AppWidgetSummary className="balance-section" sx={{ mb: 2 }} total={balance} title="Balance" icon={'mi:bar-chart-alt'} />
                <AppWidgetSummary className="deposit-section" sx={{ mb: 2 }} title="Total Deposit" total={prevDeposit} icon={'iconoir:coins-swap'} />
              </Grid>
              <Grid item xs={12} sm={3} md={3}>
                <AppWidgetSummaryUSD className="commission-section" sx={{ mb: 2 }} title="Total Commissions" total={commission} color="info" icon={'mi:layers'} />
                <AppWidgetSummary className="withdraw-section" sx={{ mb: 2 }} title="Total Withdraw" total={prevWithdraw} icon={'iconoir:coins-swap'} />
              </Grid><Grid item xs={12} sm={3} md={3}>
                <AppWidgetSummaryCommissions className="commission-section" sx={{ mb: 2 }} title="Total Commissions From Network" total={totalCommissions} color="info" icon={'mi:layers'} />
              </Grid><Grid id item xs={12} sm={3} md={3}>
                <AppCurrentVisits className="assets-section"
                  title="Assets last month"
                  change={balance - prevBalance}
                  chartData={[
                    { label: 'Profit', value: prevProfit },
                    { label: 'Deposit', value: prevDeposit > 0 ? prevDeposit : prevDeposit === 0 ? 0 : Math.abs(prevDeposit) },
                    { label: 'Withdraw', value: prevWithdraw > 0 ? prevWithdraw : prevWithdraw === 0 ? 0 : Math.abs(prevWithdraw) },
                  ]}
                  chartColors={[
                    prevProfit > 0 ? theme.palette.success.main : theme.palette.warning.main,
                    theme.palette.primary.main,
                    theme.palette.error.main,
                  ]}
                />
              </Grid>
            </>) :
            (<> <Grid item xs={12} sm={4} md={4}>
              <AppWidgetSummary className="balance-section" sx={{ mb: 2 }} total={balance} title="Balance" icon={'mi:bar-chart-alt'} />
              <AppWidgetSummary className="deposit-section" sx={{ mb: 2 }} title="Total Deposit" total={prevDeposit} icon={'iconoir:coins-swap'} />

            </Grid>
              <Grid item xs={12} sm={4} md={4}>
                <AppWidgetSummaryUSD className="commission-section" sx={{ mb: 2 }} title="Total Commissions" total={commission} color="info" icon={'mi:layers'} />
                <AppWidgetSummary className="withdraw-section" sx={{ mb: 2 }} title="Total Withdraw" total={prevWithdraw} icon={'iconoir:coins-swap'} />
              </Grid><Grid id item xs={12} sm={4} md={4}>
                <AppCurrentVisits className="assets-section"
                  title="Assets last month"
                  change={balance - prevBalance}
                  chartData={[
                    { label: 'Profit', value: prevProfit },
                    { label: 'Deposit', value: prevDeposit > 0 ? prevDeposit : prevDeposit === 0 ? 0 : Math.abs(prevDeposit) },
                    { label: 'Withdraw', value: prevWithdraw > 0 ? prevWithdraw : prevWithdraw === 0 ? 0 : Math.abs(prevWithdraw) },
                  ]}
                  chartColors={[
                    prevProfit > 0 ? theme.palette.success.main : theme.palette.warning.main,
                    theme.palette.primary.main,
                    theme.palette.error.main,
                  ]}
                />
              </Grid></>)}



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
              <Input type="text" value={`Time ${currentMonth}`} style={{ minWidth: "150px", marginLeft: "120px", paddingLeft: "20px" }} />
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
                  width: 160,
                  marginTop: '50px',
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



          <Grid item xs={12} md={12} lg={12}>

            {/* <AppWebsiteVisits
              title="Commission history"
              subheader=""
              chartLabels={commissionLabel}
              chartData={chartData2}
            /> */}

            <Card>
              <CardHeader title={"Commission history"} subheader={""} />

              <Box sx={{ p: 3, pb: 1 }} dir="ltr">
                <ReactApexChart type="line" series={chartData2} options={chartOptions2} height={364} />
              </Box>
            </Card>

            <Card>
              <CardHeader title={"Profit history"} subheader={""} />

              <Box sx={{ p: 3, pb: 1 }} dir="ltr">
                <ReactApexChart type="line" series={chartData} options={chartOptions} height={364} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <AppNewsUpdate
              title="Transactions"
              list={listTransaction}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
