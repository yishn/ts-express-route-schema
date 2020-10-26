import { expectType, TypeEqual } from 'ts-expect'
import * as t from 'tap'
import { IsAny, IsUnknown, RequestData, ResponseData } from '../src/main'

t.test('types', async t => {
  t.test('IsAny', async t => {
    expectType<IsAny<any>>(true)
    expectType<IsAny<unknown>>(false)
    expectType<IsAny<5>>(false)
    expectType<IsAny<'str'>>(false)
  })

  t.test('IsUnknown', async t => {
    expectType<IsUnknown<any>>(false)
    expectType<IsUnknown<unknown>>(true)
    expectType<IsUnknown<5>>(false)
    expectType<IsUnknown<'str'>>(false)
  })

  t.test('RequestData', async t => {
    expectType<
      TypeEqual<
        RequestData<{}>,
        {
          headers?: {}
          params?: {}
          query?: {}
          body?: undefined
        }
      >
    >(true)

    expectType<
      TypeEqual<
        RequestData<{
          params: {
            param: string
          }
          body: {
            blah: string
          }
        }>,
        {
          headers?: {}
          params: {
            param: string
          }
          query?: {}
          body: {
            blah: string
          }
        }
      >
    >(true)
  })

  t.test('ResponseData', async t => {
    expectType<
      TypeEqual<
        ResponseData<{}>,
        {
          status?: 200
          headers?: {}
          body?: undefined
        }
      >
    >(true)

    expectType<
      TypeEqual<
        ResponseData<{
          status: 200
          body: {
            blah: string
          }
        }>,
        {
          status: 200
          headers?: {}
          body: {
            blah: string
          }
        }
      >
    >(true)
  })
})