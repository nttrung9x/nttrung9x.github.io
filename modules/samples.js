export const renderSamples = async templateImports => {
	const webapp = 'https://script.google.com/macros/s/AKfycbw26MLaK1PwIGzUiStwweOeVfl-sEmIxFIs5Ax7LMoP1Cuw-s0llN-aJYS7F8vxQuVG-A/exec'
	const samples = await fetch(webapp)
		.then(response => response.json())
		.catch(error => {
			console.error(error)
			return
		})

	if (!samples) {
		return
	}

	const {
		window: windowSamples,
		math: mathSamples,
		error: errorSamples,
		html: htmlSamples,
		style: styleSamples
	} = samples || {}

	const computeData = (hash, data) => {
		let systems = []
		let poolTotal = 0
		const metricTotal = Object.keys(data).reduce((acc,item) => acc+= data[item].length, 0)
		const decryption = Object.keys(data).find(key => data[key].find(item => {
			if (!(item.id == hash)) {
				return false
			}
			systems = item.systems
			poolTotal = data[key].length
			return true
		}))

		return {
			systems,
			poolTotal,
			metricTotal,
			decryption
		}
	}
	const decryptHash = (hash, data) => {
		const { systems, poolTotal, metricTotal, decryption } = computeData(hash, data)
		const getIcon = name => `<span class="icon ${name}"></span>`
		const browserIcon = (
			!decryption ? '' :
				/edgios|edge/i.test(decryption) ? getIcon('edge') :
					/brave/i.test(decryption) ? getIcon('brave') :
						/vivaldi/i.test(decryption) ? getIcon('vivaldi') :
							/duckduckgo/i.test(decryption) ? getIcon('duckduckgo') :
								/yandex/i.test(decryption) ? getIcon('yandex') :
									/opera/i.test(decryption) ? getIcon('opera') :
										/crios|chrome/i.test(decryption) ? getIcon('chrome') :
											/tor browser/i.test(decryption) ? getIcon('tor') :
												/palemoon/i.test(decryption) ? getIcon('palemoon') :
													/fxios|firefox/i.test(decryption) ? getIcon('firefox') :
														/safari/i.test(decryption) ? getIcon('safari') :
															''
		)

		const icon = {
			blink: '<span class="icon blink"></span>',
			webkit: '<span class="icon webkit"></span>',
			tor: '<span class="icon tor"></span>',
			firefox: '<span class="icon firefox"></span>',
			cros: '<span class="icon cros"></span>',
			linux: '<span class="icon linux"></span>',
			apple: '<span class="icon apple"></span>',
			windows: '<span class="icon windows"></span>',
			android: '<span class="icon android"></span>'
		}
		const engineIcon = (
			!decryption ? '' :
				/SpiderMonkey/.test(decryption) ? icon.firefox :
					/JavaScriptCore/.test(decryption) ? icon.webkit :
						/V8/.test(decryption) ? icon.blink :
							''
		)
		const engineRendererIcon = (
			!decryption ? '' :
				/Gecko/.test(decryption) ? icon.gecko :
					/WebKit/.test(decryption) ? icon.webkit :
						/Blink/.test(decryption) ? icon.blink :
							/Goanna/.test(decryption) ? icon.goanna :
								''
		)
		const systemIcon = (
			!decryption || systems.length != 1 ? '' :
				/windows/i.test(systems[0]) ? icon.windows :
					/linux/i.test(systems[0]) ? icon.linux :
						/ipad|iphone|ipod|ios|mac/i.test(systems[0]) ? icon.apple :
							/android/.test(systems[0]) ? icon.android :
								/chrome os/i.test(systems[0]) ? icon.cros :
									''
		)

		const formatPercent = n => n.toFixed(2).replace('.00', '')
		return {
			decryption: decryption || 'unknown',
			browserHTML: (
				!decryption ? undefined : 
					`${browserIcon}${decryption}`
			),
			engineHTML: (
				!decryption ? undefined : 
					`${engineIcon}${decryption}`
			),
			engineRendererHTML: (
				!decryption ? undefined : 
					`${engineRendererIcon}${decryption}`
			),
			engineRendererSystemHTML: (
				!decryption ? undefined : 
					`${engineRendererIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
			),
			engineSystem: (
				!decryption ? undefined : 
					`${engineIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
			),
			uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
			uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
		}
	}

	

	const renderWindowSamples = ({ fp, note, patch, html }) => {
		const id = document.getElementById(`window-features-samples`)
		if (!fp.windowFeatures || !id) {
			return
		}
		const { windowFeatures: { $hash } } = fp
		const { decryption: browser, browserHTML, uniqueMetric, uniqueEngine } = decryptHash($hash, windowSamples)
		return patch(id, html`
			<div>
				<style>
					.window-features-metric-rating {
						background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
					}
					.window-features-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="window-features-metric-rating help" title="% of limited window samples">${uniqueMetric}% of samples</div>
				<div class="window-features-class-rating help" title="% of ${browser} class">${uniqueEngine}% of class</div>
				<div>version: ${browserHTML || note.unknown}</div>
			</div>
		`)
	}

	const renderMathSamples = ({ fp, note, patch, html }) => {
		const id = document.getElementById(`math-samples`)
		if (!fp.maths || !id) {
			return
		}
		const { maths: { $hash } } = fp
		const { decryption: engine, engineSystem, uniqueMetric, uniqueEngine } = decryptHash($hash, mathSamples)
		return patch(id, html`
			<div>
				<style>
					.math-metric-rating {
						background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
					}
					.math-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="math-metric-rating help" title="% of math samples">${uniqueMetric}% of samples</div>
				<div class="math-class-rating help" title="% of ${engine} class">${uniqueEngine}% of class</div>
				<div>engine: ${engineSystem || note.unknown}</div>
			</div>
		`)
	}

	const renderErrorSamples = ({ fp, note, patch, html }) => {
		const id = document.getElementById(`error-samples`)
		if (!fp.consoleErrors || !id) {
			return
		}
		const { consoleErrors: { $hash } } = fp
		const { decryption: engine, engineHTML, uniqueMetric, uniqueEngine } = decryptHash($hash, errorSamples)
		return patch(id, html`
			<div>
				<style>
					.console-errors-metric-rating {
						background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
					}
					.console-errors-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="console-errors-metric-rating help" title="% of console errors samples">${uniqueMetric}% of samples</div>
				<div class="console-errors-class-rating help" title="% of ${engine} class">${uniqueEngine}% of class</div>
				<div>engine: ${engineHTML || note.unknown}</div>
			</div>
		`)
	}

	const renderHTMLElementSamples = ({ fp, note, patch, html }) => {
		const id = document.getElementById(`html-element-samples`)
		if (!fp.htmlElementVersion || !id) {
			return
		}
		const { htmlElementVersion: { $hash } } = fp
		const { decryption: engineRenderer, engineRendererHTML, uniqueMetric, uniqueEngine } = decryptHash($hash, htmlSamples)
		return patch(id, html`
			<div>
				<style>
					.html-element-version-metric-rating {
						background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
					}
					.html-element-version-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="html-element-version-metric-rating help" title="% of limited html element samples">${uniqueMetric}% of samples</div>
				<div class="html-element-version-class-rating help" title="% of ${engineRenderer} class">${uniqueEngine}% of class</div>
				<div>engine: ${engineRendererHTML || note.unknown}</div>
			</div>
		`)
	}

	const renderSystemStylesSamples = ({ fp, note, patch, html, styleSystemHash }) => {
		const id = document.getElementById(`system-style-samples`)
		if (!fp.css || !id) {
			return
		}
		const { decryption: engineRenderer, engineRendererSystemHTML, uniqueMetric, uniqueEngine } = decryptHash(styleSystemHash, styleSamples)
		return patch(id, html`
			<div>
				<style>
					.system-styles-metric-rating {
						background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
					}
					.system-styles-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="system-styles-metric-rating help" title="% of system styles samples">${uniqueMetric}% of samples</div>
				<div class="system-styles-class-rating help" title="% of ${engineRenderer} class">${uniqueEngine}% of class</div>
				<div>engine: ${engineRendererSystemHTML || note.unknown}</div>
			</div>
		`)
	}

	renderWindowSamples(templateImports)
	renderMathSamples(templateImports)
	renderErrorSamples(templateImports)
	renderHTMLElementSamples(templateImports)
	renderSystemStylesSamples(templateImports)

	return
}