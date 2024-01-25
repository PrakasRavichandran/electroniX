import { ComponentDoubleEnded } from "./componentDoubleEnded.js"
import * as MathUtils from "./math.js"


export class ComponentVoltageSource extends ComponentDoubleEnded
{
	constructor(pos)
	{
		super(pos)
		
		this.voltage = 5
		this.isVoltageSource = true
		
		this.dcBias = 0
		this.frequency = 60
		this.amplitude = 5
		this.phaseOffset = 0
	}
	
	
	static getSaveId()
	{
		return "vs"
	}
	
	
	static getName()
	{
		return "Voltage Source"
	}
	
	
	saveToString(manager)
	{
		return this.joints[0] + "," + this.joints[1] + ",0," +
			MathUtils.valueToStringWithUnitPrefix(this.dcBias) + "," +
			MathUtils.valueToStringWithUnitPrefix(this.frequency) + "," +
			MathUtils.valueToStringWithUnitPrefix(this.amplitude) + "," +
			MathUtils.valueToStringWithUnitPrefix(this.phaseOffset) + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		const version = parseInt(reader.read())
		this.dcBias = reader.readNumber()
		this.frequency = reader.readNumber()
		this.amplitude = reader.readNumber()
		this.phaseOffset = reader.readNumber()
	}
	
	
	calculateVoltage(manager)
	{
		return this.dcBias + Math.sin((this.phaseOffset / 180 * Math.PI) + (manager.time * Math.PI * 2 * this.frequency)) * this.amplitude
	}
	
	
	solverBegin(manager, solver)
	{
		solver.stampVoltage(this.voltageSourceIndex, this.nodes[0], this.nodes[1], this.calculateVoltage(manager))
	}
	
	
	solverIterationBegin(manager, solver)
	{
		solver.stampVoltage(this.voltageSourceIndex, this.nodes[0], this.nodes[1], this.calculateVoltage(manager))
	}
	
	
	solverIterationEnd(manager, solver)
	{
		this.current = -manager.getVoltageSourceCurrent(this.voltageSourceIndex)
	}
	
	
	getEditBox(editBoxDef)
	{
		editBoxDef.addNumberInput("Amplitude",    "V",   this.amplitude,   (x) => { this.amplitude = x })
		editBoxDef.addNumberInput("DC Bias",      "V",   this.dcBias,      (x) => { this.dcBias = x })
		editBoxDef.addNumberInput("Frequency",    "Hz",  this.frequency,   (x) => { this.frequency = x })
		editBoxDef.addNumberInput("Phase Offset", "deg", this.phaseOffset, (x) => { this.phaseOffset = x })
	}
	
	
	render(manager, ctx)
	{
		const symbolSize = Math.min(50, this.getLength())
	
		const centerX = (this.points[0].x + this.points[1].x) / 2
		const centerY = (this.points[0].y + this.points[1].y) / 2
		
		this.drawSymbolBegin(manager, ctx, symbolSize)
		this.drawSymbolEnd(manager, ctx)
		
		ctx.save()
		ctx.translate(centerX, centerY)
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[1]))
		
		ctx.beginPath()
		ctx.arc(0, 0, symbolSize / 2, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.beginPath()
		ctx.moveTo          (-symbolSize * 0.3, 0)
		ctx.quadraticCurveTo(-symbolSize * 0.15, -symbolSize * 0.3, 0, 0)
		ctx.quadraticCurveTo( symbolSize * 0.15,  symbolSize * 0.3,  symbolSize * 0.3, 0)
		ctx.stroke()
		
		ctx.restore()
	}
}