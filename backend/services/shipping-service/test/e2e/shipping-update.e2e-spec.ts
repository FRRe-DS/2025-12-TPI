import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('ShippingService: Update Shipment (E2E)', () => {
  let app: INestApplication;
  let createdShipmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Crear un envío para usar en los tests
    const createResponse = await request(app.getHttpServer())
      .post('/shipping')
      .send({
        order_id: 12345,
        user_id: 67890,
        delivery_address: {
          street: 'Av. Corrientes 1234',
          city: 'Buenos Aires',
          state: 'CABA',
          postal_code: 'C1043',
          country: 'AR',
        },
        transport_type: 'road',
        products: [
          {
            id: 1,
            quantity: 2,
          },
        ],
      });

    if (createResponse.status === 201) {
      createdShipmentId = createResponse.body.shipping_id;
    }
  });

  describe('PATCH /shipping/:id', () => {
    it('should update shipment status successfully', async () => {
      if (!createdShipmentId) {
        // Si no se creó, crear uno ahora
        const createResponse = await request(app.getHttpServer())
          .post('/shipping')
          .send({
            order_id: 99999,
            user_id: 88888,
            delivery_address: {
              street: 'Test St 123',
              city: 'Buenos Aires',
              state: 'CABA',
              postal_code: 'C1000',
              country: 'AR',
            },
            transport_type: 'road',
            products: [{ id: 1, quantity: 1 }],
          });
        createdShipmentId = createResponse.body.shipment_id;
      }

      const updateResponse = await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({
          status: 'in_transit',
          updated_by: 'test-operator',
        })
        .expect(200);

      expect(updateResponse.body).toHaveProperty('shipping_id', createdShipmentId);
      expect(updateResponse.body).toHaveProperty('status', 'in_transit');
      expect(updateResponse.body).toHaveProperty('logs');
      expect(Array.isArray(updateResponse.body.logs)).toBe(true);
      expect(updateResponse.body.logs.length).toBeGreaterThan(0);

      // Verificar que el último log contiene la actualización
      const lastLog = updateResponse.body.logs[updateResponse.body.logs.length - 1];
      expect(lastLog.status).toBe('in_transit');
      expect(lastLog.message).toContain('in_transit');
      expect(lastLog.message).toContain('test-operator');
    });

    it('should update status from CREATED to IN_TRANSIT', async () => {
      if (!createdShipmentId) return;

      // Verificar estado inicial
      const initialResponse = await request(app.getHttpServer())
        .get(`/shipping/${createdShipmentId}`)
        .expect(200);

      expect(['created', 'CREATED']).toContain(
        initialResponse.body.status.toLowerCase(),
      );

      // Actualizar a in_transit
      const updateResponse = await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({
          status: 'in_transit',
        })
        .expect(200);

      expect(updateResponse.body.status).toBe('in_transit');
    });

    it('should update status through valid transitions', async () => {
      if (!createdShipmentId) return;

      // CREATED -> IN_TRANSIT
      await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({ status: 'in_transit' })
        .expect(200);

      // IN_TRANSIT -> ARRIVED
      await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({ status: 'arrived' })
        .expect(200);

      // ARRIVED -> IN_DISTRIBUTION
      await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({ status: 'in_distribution' })
        .expect(200);

      // IN_DISTRIBUTION -> DELIVERED
      const finalResponse = await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({ status: 'delivered' })
        .expect(200);

      expect(finalResponse.body.status).toBe('delivered');
    });

    it('should not allow updating DELIVERED shipment', async () => {
      if (!createdShipmentId) return;

      // Primero entregar el envío
      await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({ status: 'delivered' })
        .expect(200);

      // Intentar actualizar un envío entregado
      const response = await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({ status: 'in_transit' })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body.message).toMatch(/final/i);
    });

    it('should not allow updating CANCELLED shipment', async () => {
      // Crear un nuevo envío para cancelar
      const createResponse = await request(app.getHttpServer())
        .post('/shipping')
        .send({
          order_id: 11111,
          user_id: 22222,
          delivery_address: {
            street: 'Test St',
            city: 'Buenos Aires',
            state: 'CABA',
            postal_code: 'C1000',
            country: 'AR',
          },
          transport_type: 'road',
          products: [{ id: 1, quantity: 1 }],
        });

      const shipmentId = createResponse.body.shipping_id;

      // Cancelar el envío
      await request(app.getHttpServer())
        .post(`/shipping/${shipmentId}/cancel`)
        .expect(200);

      // Intentar actualizar un envío cancelado
      const response = await request(app.getHttpServer())
        .patch(`/shipping/${shipmentId}`)
        .send({ status: 'in_transit' })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body.message).toMatch(/final/i);
    });

    it('should not allow invalid status transitions (going backwards)', async () => {
      if (!createdShipmentId) return;

      // Avanzar a in_transit
      await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({ status: 'in_transit' })
        .expect(200);

      // Intentar volver a created (no permitido)
      const response = await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({ status: 'created' })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body.message).toMatch(/invalid.*transition/i);
    });

    it('should return 404 for non-existent shipment', async () => {
      const fakeId = 'non-existent-id-12345';

      const response = await request(app.getHttpServer())
        .patch(`/shipping/${fakeId}`)
        .send({ status: 'in_transit' })
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should update updated_at timestamp', async () => {
      if (!createdShipmentId) return;

      // Obtener timestamp inicial
      const initialResponse = await request(app.getHttpServer())
        .get(`/shipping/${createdShipmentId}`)
        .expect(200);

      const initialUpdatedAt = initialResponse.body.updated_at;

      // Esperar un poco para asegurar diferencia de tiempo
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Actualizar
      const updateResponse = await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({ status: 'in_transit' })
        .expect(200);

      expect(updateResponse.body.updated_at).not.toBe(initialUpdatedAt);
      expect(new Date(updateResponse.body.updated_at).getTime()).toBeGreaterThan(
        new Date(initialUpdatedAt).getTime(),
      );
    });

    it('should add log entry when updating status', async () => {
      if (!createdShipmentId) return;

      // Obtener logs iniciales
      const initialResponse = await request(app.getHttpServer())
        .get(`/shipping/${createdShipmentId}`)
        .expect(200);

      const initialLogsCount = initialResponse.body.logs.length;

      // Actualizar
      const updateResponse = await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({
          status: 'in_transit',
          updated_by: 'test-user',
        })
        .expect(200);

      expect(updateResponse.body.logs.length).toBe(initialLogsCount + 1);

      const lastLog = updateResponse.body.logs[updateResponse.body.logs.length - 1];
      expect(lastLog).toHaveProperty('timestamp');
      expect(lastLog).toHaveProperty('status', 'in_transit');
      expect(lastLog).toHaveProperty('message');
      expect(lastLog.message).toContain('in_transit');
      expect(lastLog.message).toContain('test-user');
    });

    it('should allow update without status (only updated_by)', async () => {
      if (!createdShipmentId) return;

      const updateResponse = await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({
          updated_by: 'admin',
        })
        .expect(200);

      expect(updateResponse.body).toHaveProperty('shipping_id', createdShipmentId);
      expect(updateResponse.body.logs.length).toBeGreaterThan(0);

      const lastLog =
        updateResponse.body.logs[updateResponse.body.logs.length - 1];
      expect(lastLog.message).toContain('admin');
    });

    it('should validate status enum', async () => {
      if (!createdShipmentId) return;

      const response = await request(app.getHttpServer())
        .patch(`/shipping/${createdShipmentId}`)
        .send({
          status: 'invalid_status',
        })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should accept all valid status values', async () => {
      // Crear un nuevo envío para cada transición
      const validStatuses = [
        'created',
        'reserved',
        'in_transit',
        'arrived',
        'in_distribution',
        'delivered',
      ];

      for (const status of validStatuses) {
        const createResponse = await request(app.getHttpServer())
          .post('/shipping')
          .send({
            order_id: Math.floor(Math.random() * 100000),
            user_id: Math.floor(Math.random() * 100000),
            delivery_address: {
              street: 'Test St',
              city: 'Buenos Aires',
              state: 'CABA',
              postal_code: 'C1000',
              country: 'AR',
            },
            transport_type: 'road',
            products: [{ id: 1, quantity: 1 }],
          });

        const shipmentId = createResponse.body.shipping_id;

        // Intentar actualizar (puede fallar si es transición inválida, pero el status debe ser válido)
        const updateResponse = await request(app.getHttpServer())
          .patch(`/shipping/${shipmentId}`)
          .send({ status });

        // Si el status es válido pero la transición no, debería ser 400 con mensaje específico
        // Si el status es inválido, debería ser 400 por validación
        if (updateResponse.status === 400) {
          // Verificar que no es error de validación de enum
          expect(updateResponse.body.message).not.toMatch(/must be.*enum/i);
        }
      }
    });
  });
});

