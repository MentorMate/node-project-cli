const extend = require('./js-linters-extension')
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks')

describe('js-linters-extension', () => {
  let toolbox

  beforeEach(() => {
    toolbox = createToolboxMock()
    extend(toolbox)
  })

  it('should be defined', () => {
    expect(extend).toBeDefined()
  })

  it('should set jsLinters on toolbox', () => {
    expect(toolbox.jsLinters).toBeDefined()
  })

  describe('jsLinters', () => {
    const input = createExtensionInput()
    let ops

    beforeEach(() => {
      ops = toolbox.jsLinters(input)
    })

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined()
      expect(ops.asyncOperations).toBeDefined()
    })

    describe('syncOperations', () => {
      let scripts
      let packages

      beforeAll(() => {
        input.projectLanguage = 'JS'
      })

      beforeEach(() => {
        toolbox.jsLinters(input).syncOperations()
        scripts = Object.assign({}, ...input.pkgJsonScripts)
        packages = input.pkgJsonInstalls.map((s) => s.split(' ')).flat(1)
      })

      it('should add a prettier:format script', () => {
        expect(scripts['prettier:format']).toBe('prettier . --write')
      })

      it('should add a prettier:check-format script', () => {
        expect(scripts['prettier:check-format']).toBe(
          'prettier . --list-different'
        )
      })

      describe('when the language is TypeScript', () => {
        beforeAll(() => {
          input.projectLanguage = 'TS'
        })

        it('should add a lint script', () => {
          expect(scripts['lint']).toBe('eslint . --ext .js,.cjs,.mjs,.ts')
        })

        it('should add the @typescript-eslint/eslint-plugin package', () => {
          expect(packages).toContain('@typescript-eslint/eslint-plugin')
        })

        it('should add the @typescript-eslint/parser package', () => {
          expect(packages).toContain('@typescript-eslint/parser')
        })
      })

      describe('when the language is JavaScript', () => {
        beforeAll(() => {
          input.projectLanguage = 'JS'
        })

        it('should add a lint script', () => {
          expect(scripts['lint']).toBe('eslint . --ext .js,.cjs,.mjs')
        })
      })

      it('should add a lint:fix script', () => {
        expect(scripts['lint:fix']).toBe('npm run lint --fix')
      })

      it('should add the prettier package', () => {
        expect(packages).toContain('prettier')
      })

      it('should add the eslint package', () => {
        expect(packages).toContain('eslint')
      })

      it('should add the eslint-config-prettier package', () => {
        expect(packages).toContain('eslint-config-prettier')
      })

      it('should add the eslint-config-google package', () => {
        expect(packages).toContain('eslint-config-google')
      })

      it('should add the eslint-plugin-prettier package', () => {
        expect(packages).toContain('eslint-plugin-prettier')
      })
    })

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.print.muted = jest.fn(() => {})
        toolbox.print.success = jest.fn(() => {})
        toolbox.print.error = jest.fn(() => {})
        toolbox.template.generate = jest.fn(() => {})
        toolbox.filesystem.copyAsync = jest.fn(() => {})
        await toolbox.jsLinters(input).asyncOperations()
      })

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1)
        expect(toolbox.print.success).toHaveBeenCalledTimes(1)
        expect(toolbox.print.error).not.toHaveBeenCalled()
      })

      it('should generate an eslint config', () => {
        expect(toolbox.template.generate).toHaveBeenCalled()
        const opts = toolbox.template.generate.mock.calls[0][0]
        expect(opts.template).toBe('eslintrc-model.js.ejs')
        expect(opts.target).toBe(`${input.appDir}/.eslintrc.js`)
      })

      it('should generate a prettier config', () => {
        expect(toolbox.template.generate).toHaveBeenCalledTimes(2)
        const opts = toolbox.template.generate.mock.calls[1][0]
        expect(opts.template).toBe('prettierrc-model.js.ejs')
        expect(opts.target).toBe(`${input.appDir}/.prettierrc.js`)
      })

      it('should copy the .eslintignore file', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.eslintignore`,
          `${input.appDir}/.eslintignore`
        )
      })

      it('should copy the prettier ignore fire', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.prettierignore`,
          `${input.appDir}/.prettierignore`
        )
      })

      describe('when an error is thrown', () => {
        const error = new Error('the-error')

        beforeEach(() => {
          toolbox.template.generate = jest.fn(() => {
            throw error
          })
        })

        it('should rethrow the error with an added user-friendly message', () => {
          expect(toolbox.jsLinters(input).asyncOperations()).rejects.toThrow(
            `An error has occurred while executing JS linters configuration: ${error}`
          )
        })
      })
    })
  })
})
