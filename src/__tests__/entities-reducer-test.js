jest.dontMock('../entities-reducer');
jest.dontMock('../middleware');

const {
  LAGER_SUCCESS,
  LAGER_ACTION,
} = require('../middleware');
const entities = require('../entities-reducer').default;

describe('MetaReducer', () => {
  let state = {};
  const successWith = data => ({
    [LAGER_ACTION]: LAGER_SUCCESS,
    ...data,
  });
  it('should store entities', () => {
    const oneEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              name: 'Karl',
            },
          },
        },
      },
    });
    state = entities(state, oneEntityAction);
    expect(state.users[1].name).toEqual('Karl');
  });
  it('should append entities', () => {
    const oneEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              age: 15,
            },
          },
        },
      },
    });
    state = entities(state, oneEntityAction);
    expect(state.users[1].name).toEqual('Karl');
    expect(state.users[1].age).toEqual(15);
  });
  it('should append nested structure of entities', () => {
    const oneEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              interests: {
                rowing: {
                  grade: 15,
                  time: 10,
                },
              },
            },
          },
        },
      },
    });
    state = entities(state, oneEntityAction);
    const anotherEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              interests: {
                rowing: {
                  grade: 25,
                },
                fishing: {
                  grade: 99,
                },
              },
            },
          },
        },
      },
    });
    state = entities(state, anotherEntityAction);
    const lastEntityAction = successWith({
      response: {
        entities: {
          users: {
            1: {
              interests: {
              },
            },
          },
        },
      },
    });
    state = entities(state, lastEntityAction);
    expect(state.users[1].name).toEqual('Karl');
    expect(state.users[1].age).toEqual(15);
    expect(state.users[1].interests.rowing.grade).toEqual(25);
    expect(state.users[1].interests.rowing.time).toEqual(10);
    expect(state.users[1].interests.fishing.grade).toEqual(99);
  });
});
