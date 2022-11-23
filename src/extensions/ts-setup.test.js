const extend = require('./ts-setup')
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks')

describe('ts-setup', () => {
  let toolbox

  beforeEach(() => {
    toolbox = createToolboxMock()
    extend(toolbox)
  })

  it('should be defined', () => {
    expect(extend).toBeDefined()
  })

  it('should set setupTs on toolbox', () => {
    expect(toolbox.setupTs).toBeDefined()
  })

  describe('setupTs', () => {
    const input = createExtensionInput()
    let ops

    beforeEach(() => {
      ops = toolbox.setupTs(input)
    })

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined()
      expect(ops.asyncOperations).toBeDefined()
    })

    describe('syncOperations', () => {
      let scripts
      let packages

      beforeAll(() => {
        input.framework = 'nest'
      })

      beforeEach(() => {
        toolbox.filesystem.copy = jest.fn(() => {})
        toolbox.filesystem.read = jest.fn(() =>
          JSON.stringify({ compilerOptions: {} })
        )
        toolbox.filesystem.write = jest.fn(() => {})
        toolbox.setupTs(input).syncOperations()
        scripts = Object.assign({}, ...input.pkgJsonScripts)
        packages = input.pkgJsonInstalls.map((s) => s.split(' ')).flat(1)
      })

      describe('when the framework is not Nest', () => {
        beforeAll(() => {
          input.framework = 'express'
          input.pkgJsonScripts = []
          input.pkgJsonInstalls = []
        })

        it('should copy the tsconfig file', () => {
          expect(toolbox.filesystem.copy).toHaveBeenCalledWith(
            `${input.assetsPath}/tsconfig.json`,
            `${input.appDir}/tsconfig.json`
          )
        })

        it('should add a build script', () => {
          expect(scripts['build']).toBe('tsc --build && tsc-alias')
        })

        it('should add a prepare script', () => {
          expect(scripts['prepare']).toBe('npm run build')
        })

        it('should add the typescript package', () => {
          expect(packages).toContain('typescript')
        })

        it('should add the @tsconfig/recommended package', () => {
          expect(packages).toContain('@tsconfig/recommended')
        })

        it('should add the tsc-alias package', () => {
          expect(packages).toContain('tsc-alias')
        })
      })

      describe('when the framework is Nest', () => {
        beforeAll(() => {
          input.framework = 'nest'
          input.pkgJsonScripts = []
          input.pkgJsonInstalls = []
        })

        it('should not copy the tsconfig', () => {
          expect(toolbox.filesystem.copy).not.toHaveBeenCalled()
        })

        it('should not add any scripts or packages', () => {
          expect(Object.keys(scripts).length).toBe(0)
          expect(packages.length).toBe(0)
        })
      })

      describe('when the module system is ESM', () => {
        beforeAll(() => {
          input.moduleType = 'ESM'
        })

        it('should update the tsconfig file', () => {
          expect(toolbox.filesystem.read).toHaveBeenCalledWith(
            `${input.appDir}/tsconfig.json`
          )
          expect(toolbox.filesystem.write).toHaveBeenCalled()
          const config = toolbox.filesystem.write.mock.calls[0][1]
          expect(config.compilerOptions.module).toBe('ES2015')
        })
      })
    })

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.print.muted = jest.fn(() => {})
        toolbox.print.success = jest.fn(() => {})
        toolbox.print.error = jest.fn(() => {})
        toolbox.filesystem.copyAsync = jest.fn(() => {})
        await toolbox.setupTs(input).asyncOperations()
      })

      describe('when the framework is not Nest', () => {
        beforeAll(() => {
          input.framework = 'express'
        })

        it('should print a muted and a success message', () => {
          expect(toolbox.print.muted).toHaveBeenCalledTimes(1)
          expect(toolbox.print.success).toHaveBeenCalledTimes(1)
          expect(toolbox.print.error).not.toHaveBeenCalled()
        })

        it('should copy the tsconfig file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/tsconfig.build.json`,
            `${input.appDir}/tsconfig.build.json`
          )
        })
      })

      describe('when the framework is Nest', () => {
        beforeAll(() => {
          input.framework = 'nest'
        })

        it('should not a muted nor a success message', () => {
          expect(toolbox.print.muted).not.toHaveBeenCalled()
          expect(toolbox.print.success).not.toHaveBeenCalled()
          expect(toolbox.print.error).not.toHaveBeenCalled()
        })

        it('should not copy anything', () => {
          expect(toolbox.filesystem.copyAsync).not.toHaveBeenCalled()
        })
      })

      describe('when an error is thrown', () => {
        const error = new Error('the-error')

        beforeAll(() => {
          input.framework = 'express'
        })

        beforeEach(() => {
          toolbox.filesystem.copyAsync = jest.fn(() => {
            throw error
          })
        })

        it('should rethrow the error with an added user-friendly message', () => {
          expect(toolbox.setupTs(input).asyncOperations()).rejects.toThrow(
            `An error has occurred while executing TS configuration: ${error}`
          )
        })
      })
    })
  })
})
