import { faker } from '@faker-js/faker';
import axios from 'axios';
import Swal from 'sweetalert2';

import { prod, dev } from "../utils/env";

const products = [];
const email = localStorage.getItem("email");
const accessToken = localStorage.getItem("access_token");

if (email && accessToken) {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${prod}/api/v1/secured/getNetwork/${email}`,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };
  axios.request(config)
    .then((response) => {
      response.data.forEach((item, index) => {
        index += 1;
        products.push({ id: index, cover: `/assets/images/products/product_${index}.jpg`, name: item.email, refferer: item.refferer, price: faker.datatype.number({ min: 4, max: 99, precision: 0.01 }) })
      })
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
          // window.location.href = '/login';
        });
      }
    });
}

export default products;