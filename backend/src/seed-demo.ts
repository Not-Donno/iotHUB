import { NestFactory } from '@nestjs/core';
import { hash } from 'bcryptjs';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module.js';
import { User, UserRole } from './users/entities/user.entity.js';
import { Product, ProductStatus } from './products/entities/products.entity.js';

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Demo@1234';

type SeedProduct = {
  name: string;
  // lowercase, matching the write path's folding
  category: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
};

const CUSTOMERS = ['demo.customer@iothub.test', 'pasang@iothub.test'] as const;

// NPR prices, realistic for a Nepali electronics shop. Currency is left at the
// entity default (NPR).
const VENDORS: { email: string; products: SeedProduct[] }[] = [
  {
    email: 'kathmandu.electronics@iothub.test',
    products: [
      {
        name: 'ESP32 DevKit V1',
        category: 'boards',
        description:
          '38-pin ESP32-WROOM-32 board with WiFi and Bluetooth, dual-core 240MHz, USB-C.',
        price: 850,
        stock: 24,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'ESP8266 NodeMCU CP2102',
        category: 'boards',
        description: 'WiFi development board, 4MB flash, CP2102 USB bridge.',
        price: 620,
        stock: 0,
        status: ProductStatus.ARCHIVED,
      },
      {
        name: 'Arduino Uno R3',
        category: 'boards',
        description:
          'ATmega328P board, USB-B, 14 digital / 6 analog pins. The one every tutorial assumes.',
        price: 950,
        stock: 18,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'Raspberry Pi 5 8GB',
        category: 'boards',
        description:
          'Quad-core Cortex-A76 single-board computer, PCIe, dual 4K output.',
        price: 21500,
        stock: 4,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'Raspberry Pi 4 Model B 4GB',
        category: 'boards',
        description:
          'Dual micro-HDMI, Gigabit Ethernet, USB 3.0. Great as a home server or IoT hub.',
        price: 13500,
        stock: 0,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'ESP32-CAM',
        category: 'boards',
        description:
          'WiFi camera module with OV2640 and microSD slot, runs face-detection sketches.',
        price: 1250,
        stock: 11,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'ESP32-S3 DevKitC',
        category: 'boards',
        description:
          'Native USB and vector instructions for on-device ML. Next shipment lands in a few weeks.',
        price: 1850,
        stock: 0,
        status: ProductStatus.DRAFT,
      },
    ],
  },
  {
    email: 'himalayan.iot@iothub.test',
    products: [
      {
        name: 'DHT22 Temperature & Humidity Sensor',
        category: 'sensors',
        description: 'AM2302 digital sensor, ±0.5°C accuracy, single-wire interface.',
        price: 550,
        stock: 40,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'MQ-2 Gas Sensor Module',
        category: 'sensors',
        description:
          'Detects LPG, methane, propane and smoke. Analog and digital output.',
        price: 330,
        stock: 35,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'HC-SR501 PIR Motion Sensor',
        category: 'sensors',
        description:
          'Adjustable sensitivity and delay, 3-7m detection range, 4.5-20V.',
        price: 260,
        stock: 50,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'PZEM-004T v3 Energy Meter Module',
        category: 'sensors',
        description:
          '100A AC monitoring over UART: voltage, current, power and kWh. Popular for home energy dashboards.',
        price: 2650,
        stock: 9,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'YF-S201 Water Flow Sensor',
        category: 'sensors',
        description: 'Hall-effect flow meter, 1-30 L/min, 1/2 inch threaded.',
        price: 640,
        stock: 22,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'Capacitive Soil Moisture Sensor',
        category: 'sensors',
        description:
          'Corrosion-resistant probe with analog output. Built for terrace-farming setups.',
        price: 380,
        stock: 30,
        status: ProductStatus.ACTIVE,
      },
    ],
  },
  {
    email: 'pokhara.robotics@iothub.test',
    products: [
      {
        name: 'SG90 Micro Servo',
        category: 'robotics',
        description: '9g servo, 180°, 1.8kg·cm torque, 4.8-6V.',
        price: 280,
        stock: 60,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'L298N Motor Driver Module',
        category: 'robotics',
        description: 'Dual H-bridge, drives two DC motors or one stepper, 5-35V.',
        price: 450,
        stock: 25,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'HC-SR04 Ultrasonic Sensor',
        category: 'robotics',
        description: '2-400cm distance sensor, 5V, the classic robotics rangefinder.',
        price: 290,
        stock: 45,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'MG996R Servo',
        category: 'robotics',
        description:
          '11kg·cm metal-gear servo for robot arms and RC builds.',
        price: 950,
        stock: 15,
        status: ProductStatus.ACTIVE,
      },
    ],
  },
  {
    email: 'everest.components@iothub.test',
    products: [
      {
        name: 'SIM800L GSM Module',
        category: 'connectivity',
        description:
          'Quad-band GSM/GPRS breakout for SMS and calls. Works with Ncell and NTC SIM cards.',
        price: 1450,
        stock: 12,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'LoRa SX1278 433MHz Module',
        category: 'connectivity',
        description:
          'Long-range low-power radio, up to ~5km line of sight, SPI interface.',
        price: 1850,
        stock: 7,
        status: ProductStatus.ACTIVE,
      },
      {
        name: '5V 4-Channel Relay Module',
        category: 'power',
        description:
          'Opto-isolated relays with 10A contacts. Switch lights and pumps from GPIO.',
        price: 480,
        stock: 28,
        status: ProductStatus.ACTIVE,
      },
      {
        name: '16x2 Character LCD',
        category: 'displays',
        description: 'HD44780-compatible 1602 display, white on blue, 5V.',
        price: 350,
        stock: 33,
        status: ProductStatus.ACTIVE,
      },
      {
        name: '18650 Li-ion Cell 2600mAh',
        category: 'power',
        description:
          'Flat-top cell for packs and power banks. Authentic cells, restocking next week.',
        price: 420,
        stock: 0,
        status: ProductStatus.DRAFT,
      },
    ],
  },
];

async function seed() {
  const password = process.env.SEED_DEMO_PASSWORD ?? DEFAULT_PASSWORD;
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const users = dataSource.getRepository(User);
    const products = dataSource.getRepository(Product);

    // every demo account shares one password; bcrypt is slow on purpose, so
    // hash it once instead of per account
    const password_hash = await hash(password, SALT_ROUNDS);

    const ensureUser = async (email: string, role: UserRole) => {
      const existing = await users.findOneBy({ email });
      if (existing) {
        console.log(`= user ${email} (${existing.role})`);
        return existing;
      }
      const created = await users.create({ email, password_hash, role });
      await users.save(created);
      console.log(`+ user ${email} (${role})`);
      return created;
    };

    for (const email of CUSTOMERS) {
      await ensureUser(email, UserRole.CUSTOMER);
    }

    for (const vendor of VENDORS) {
      const account = await ensureUser(vendor.email, UserRole.VENDOR);

      for (const product of vendor.products) {
        // idempotent on (vendor, name): no unique constraint covers this pair
        // in the schema, so the seed carries its own check
        const existing = await products.findOne({
          where: { name: product.name, vendor: { id: account.id } },
        });
        if (existing) {
          // rows seeded before `category` existed: backfill once so an
          // already-seeded dev DB still gets the filter data
          if (!existing.category && product.category) {
            await products.save({ ...existing, category: product.category });
            console.log(`~ product "${product.name}" category backfilled`);
          } else {
            console.log(`= product "${product.name}" (${vendor.email})`);
          }
          continue;
        }
        // write through the relation, never a bare vendor_id (GOTCHAS #1)
        await products.save(
          products.create({ ...product, vendor: { id: account.id } }),
        );
        console.log(`+ product "${product.name}" (${vendor.email})`);
      }
    }

    if (!process.env.SEED_DEMO_PASSWORD) {
      console.log(
        `\ndemo password for every account: ${DEFAULT_PASSWORD} (dev only - change it)`,
      );
    }
  } finally {
    await app.close();
  }
}

await seed();
